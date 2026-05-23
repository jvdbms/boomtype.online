import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Timer, RefreshCw, Zap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateCategoryWords } from "@/lib/words";
import { saveLastResult } from "@/lib/storage";
import AdBanner from "@/components/AdBanner";
import VoiceInstructor, { useVoice } from "@/components/VoiceInstructor";

type TextCategory = "common" | "literature" | "code" | "random";

const CATEGORY_LABELS: Record<TextCategory, string> = {
  common: "Common Words",
  literature: "Literature",
  code: "Code",
  random: "Random",
};

const DURATIONS = [
  { val: 30,  label: "30s"   },
  { val: 60,  label: "1 min" },
  { val: 120, label: "2 min" },
  { val: 180, label: "3 min" },
  { val: 240, label: "4 min" },
  { val: 300, label: "5 min" },
];

export default function TypingTest() {
  const [, setLocation] = useLocation();
  const [duration, setDuration] = useState<number>(30);
  const [category, setCategory] = useState<TextCategory>("common");

  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [input, setInput] = useState("");
  const [completedWords, setCompletedWords] = useState<string[]>([]); // user input for each completed word
  // Per-keystroke outcome for the *current* word, so Backspace can reverse counters.
  // Length always equals `input.length`. true = was correct at the moment of typing.
  const charOutcomesRef = useRef<boolean[]>([]);

  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  // Refs for stable counters that don't trigger re-renders
  const correctCharsRef = useRef(0);
  const incorrectCharsRef = useRef(0);
  const totalKeystrokesRef = useRef(0);
  const correctKeystrokesRef = useRef(0);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statsTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const wordContainerRef = useRef<HTMLDivElement>(null);
  const mistakeCharsRef = useRef<string[]>([]);
  const halfSpokenRef = useRef(false);

  const { speak } = useVoice();

  useEffect(() => {
    document.title = "Typing Speed Test | BoomType — Test Your WPM Free";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Free online typing speed test. Measure your WPM and accuracy in 30s or 60s. Choose from common words, literature, code, and more.");
  }, []);

  const resetTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (statsTimerRef.current) clearInterval(statsTimerRef.current);
    const fresh = generateCategoryWords(category, 80);
    setWords(fresh);
    setCurrentWordIndex(0);
    setInput("");
    setCompletedWords([]);
    setIsStarted(false);
    setIsFinished(false);
    setTimeLeft(duration);
    setWpm(0);
    setAccuracy(100);
    correctCharsRef.current = 0;
    incorrectCharsRef.current = 0;
    totalKeystrokesRef.current = 0;
    correctKeystrokesRef.current = 0;
    mistakeCharsRef.current = [];
    charOutcomesRef.current = [];
    halfSpokenRef.current = false;
  }, [duration, category]);

  useEffect(() => { resetTest(); }, [resetTest]);

  const finishTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (statsTimerRef.current) clearInterval(statsTimerRef.current);
    setIsFinished(true);
    const elapsedMin = Math.max((Date.now() - startTimeRef.current) / 60000, 1 / 60);
    const finalWpm = Math.round((correctCharsRef.current / 5) / elapsedMin);
    const totalChars = correctCharsRef.current + incorrectCharsRef.current;
    const finalAcc = totalChars > 0
      ? Math.round((correctCharsRef.current / totalChars) * 100)
      : 100;
    setWpm(finalWpm);
    setAccuracy(finalAcc);
    speak(`Test complete! You scored ${finalWpm} words per minute with ${finalAcc} percent accuracy. Excellent!`, true);
    saveLastResult({
      wpm: finalWpm,
      accuracy: finalAcc,
      mistakes: incorrectCharsRef.current,
      duration,
      mistakeChars: mistakeCharsRef.current,
    });
    setTimeout(() => setLocation("/results"), 1200);
  }, [duration, setLocation, speak]);

  // Main timer (countdown + half-time speak) — uses refs so callbacks stay stable
  useEffect(() => {
    if (!isStarted || isFinished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          finishTest();
          return 0;
        }
        if (prev === Math.floor(duration / 2) && !halfSpokenRef.current) {
          halfSpokenRef.current = true;
          speak("Halfway there! Keep going!");
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isStarted, isFinished, duration, finishTest, speak]);

  // Live WPM/accuracy update — runs at 4Hz independent of keystrokes for smoothness
  useEffect(() => {
    if (!isStarted || isFinished) return;
    statsTimerRef.current = setInterval(() => {
      const elapsedMin = Math.max((Date.now() - startTimeRef.current) / 60000, 1 / 60);
      const liveWpm = Math.round((correctCharsRef.current / 5) / elapsedMin);
      const total = correctCharsRef.current + incorrectCharsRef.current;
      const liveAcc = total > 0
        ? Math.round((correctCharsRef.current / total) * 100)
        : 100;
      setWpm(liveWpm);
      setAccuracy(liveAcc);
    }, 250);
    return () => { if (statsTimerRef.current) clearInterval(statsTimerRef.current); };
  }, [isStarted, isFinished]);

  const startIfNeeded = useCallback(() => {
    if (isStarted || isFinished) return;
    setIsStarted(true);
    startTimeRef.current = Date.now();
    speak("Test started! Go!", true);
  }, [isStarted, isFinished, speak]);

  // Single keystroke handler — preventDefault on everything we own, so the
  // hidden input never desyncs from our state.
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isFinished) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const key = e.key;
    const currentWord = words[currentWordIndex];
    if (!currentWord) return;

    // Space / Enter: ONLY advance if the user fully typed the word
    if (key === " " || key === "Enter") {
      e.preventDefault();
      startIfNeeded();
      if (input.length === 0) return; // ignore leading space — no skip
      totalKeystrokesRef.current += 1;

      if (input === currentWord) {
        // Word fully correct — count the space as a correct keystroke + char
        correctCharsRef.current += 1;
        correctKeystrokesRef.current += 1;
        setCompletedWords(prev => [...prev, input]);
        setCurrentWordIndex(prev => {
          const next = prev + 1;
          // Pre-load more words when buffer is low
          if (next >= words.length - 10) {
            const more = generateCategoryWords(category, 30);
            setWords(w => [...w, ...more]);
          }
          return next;
        });
        setInput("");
        charOutcomesRef.current = [];
      } else {
        // Word incomplete or has mistakes — DO NOT advance. Strict mode: no skipping.
        // The space itself is "wrong" so it doesn't artificially inflate accuracy.
        // We do not append space to input, forcing the user to correct first.
      }
      return;
    }

    if (key === "Backspace") {
      e.preventDefault();
      if (input.length > 0) {
        // Reverse the keystroke we accounted for when this char was typed
        const last = charOutcomesRef.current.pop();
        if (last === true) {
          correctCharsRef.current = Math.max(0, correctCharsRef.current - 1);
          correctKeystrokesRef.current = Math.max(0, correctKeystrokesRef.current - 1);
        } else if (last === false) {
          incorrectCharsRef.current = Math.max(0, incorrectCharsRef.current - 1);
        }
        totalKeystrokesRef.current = Math.max(0, totalKeystrokesRef.current - 1);
        setInput(input.slice(0, -1));
      }
      return;
    }

    // Printable single character
    if (key.length === 1 && key.charCodeAt(0) >= 0x20) {
      e.preventDefault();
      startIfNeeded();
      // Cap typed length to prevent runaway input. Allow up to word length + 6 extras
      // so user can see they overshot, but anything beyond is ignored.
      if (input.length >= currentWord.length + 6) return;

      totalKeystrokesRef.current += 1;
      const expected = currentWord[input.length];
      const isCorrect = key === expected;
      if (isCorrect) {
        correctCharsRef.current += 1;
        correctKeystrokesRef.current += 1;
      } else {
        incorrectCharsRef.current += 1;
        if (expected) mistakeCharsRef.current.push(expected);
      }
      charOutcomesRef.current.push(isCorrect);
      setInput(prev => prev + key);
    }
  }, [isFinished, input, currentWordIndex, words, category, startIfNeeded]);

  // Derive char-state for the current word from `input` — no stored state to desync
  type CharState = "waiting" | "correct" | "incorrect" | "extra" | "current";
  const currentWordStates = useMemo(() => {
    const word = words[currentWordIndex] || "";
    const cells: { char: string; state: CharState }[] = [];
    for (let i = 0; i < word.length; i++) {
      if (i < input.length) {
        cells.push({ char: word[i], state: input[i] === word[i] ? "correct" : "incorrect" });
      } else if (i === input.length) {
        cells.push({ char: word[i], state: "current" });
      } else {
        cells.push({ char: word[i], state: "waiting" });
      }
    }
    // Any extra chars the user typed past word length
    if (input.length > word.length) {
      for (let i = word.length; i < input.length; i++) {
        cells.push({ char: input[i], state: "extra" });
      }
    }
    return cells;
  }, [words, currentWordIndex, input]);

  const timerPercent = (timeLeft / duration) * 100;

  // Render-window of words for performance (don't render hundreds at once)
  const visibleStart = Math.max(0, currentWordIndex - 6);
  const visibleEnd = currentWordIndex + 40;
  const visibleWords = words.slice(visibleStart, visibleEnd);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2">Typing Speed Test</h1>
          <p className="text-muted-foreground">Click below and start typing to begin</p>
        </div>

        {/* Controls row */}
        {!isStarted && !isFinished && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <div className="flex gap-2 flex-wrap justify-center">
              {DURATIONS.map(({ val, label }) => (
                <Button
                  key={val}
                  variant={duration === val ? "default" : "outline"}
                  onClick={() => setDuration(val)}
                  className={`px-4 font-bold ${duration === val ? "bg-primary text-white" : "border-border/60 hover:bg-white/5"}`}
                  data-testid={`button-duration-${val}`}
                >
                  {label}
                </Button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {(Object.keys(CATEGORY_LABELS) as TextCategory[]).map(cat => (
                <Button
                  key={cat}
                  variant={category === cat ? "default" : "outline"}
                  onClick={() => setCategory(cat)}
                  size="sm"
                  className={`gap-1.5 ${category === cat ? "bg-accent/80 text-white border-accent" : "border-border/60 hover:bg-white/5 text-muted-foreground"}`}
                >
                  <BookOpen className="w-3 h-3" />
                  {CATEGORY_LABELS[cat]}
                </Button>
              ))}
            </div>
            <VoiceInstructor />
          </div>
        )}

        {/* Timer & Stats */}
        <div className="flex items-center justify-center gap-8 mb-6">
          <div className="text-center">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Timer className="w-4 h-4" />
              Time
            </div>
            <div className={`text-5xl font-black tabular-nums ${timeLeft <= 10 && isStarted ? "text-destructive" : "text-primary"}`} data-testid="timer-display">
              {timeLeft}
            </div>
          </div>
          <div className="w-px h-16 bg-border/60" />
          <div className="text-center">
            <div className="text-muted-foreground text-sm mb-1">WPM</div>
            <div className="text-5xl font-black tabular-nums gradient-text" data-testid="wpm-display">
              {wpm}
            </div>
          </div>
          <div className="w-px h-16 bg-border/60" />
          <div className="text-center">
            <div className="text-muted-foreground text-sm mb-1">Accuracy</div>
            <div className="text-5xl font-black tabular-nums" data-testid="accuracy-display">
              {accuracy}<span className="text-2xl text-muted-foreground">%</span>
            </div>
          </div>
          <div className="w-px h-16 bg-border/60" />
          <div className="text-center">
            <div className="text-muted-foreground text-sm mb-1">Errors</div>
            <div className="text-5xl font-black tabular-nums text-destructive" data-testid="errors-display">
              {incorrectCharsRef.current}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-border/40 rounded-full mb-8 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            style={{ width: `${timerPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Typing Area */}
        <div
          className="relative rounded-2xl bg-card border border-border/60 p-8 mb-6 cursor-text"
          onClick={() => hiddenInputRef.current?.focus()}
          data-testid="typing-area"
        >
          {!isStarted && !isFinished && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-card/50 backdrop-blur-sm z-10">
              <div className="text-center">
                <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-lg font-bold">Click here to start</p>
                <p className="text-sm text-muted-foreground mt-1">Then start typing — <span className="text-primary font-medium">{CATEGORY_LABELS[category]}</span> mode</p>
              </div>
            </div>
          )}

          <div
            ref={wordContainerRef}
            className="font-mono text-2xl leading-relaxed select-none flex flex-wrap gap-x-3 gap-y-2"
            style={{ maxHeight: "168px", overflow: "hidden" }}
          >
            {visibleWords.map((word, relIdx) => {
              const absIdx = relIdx + visibleStart;
              const isCurrent = absIdx === currentWordIndex;
              const isDone = absIdx < currentWordIndex;
              const doneInput = isDone ? completedWords[absIdx] : undefined;

              if (isCurrent) {
                return (
                  <span key={absIdx} className="relative">
                    {currentWordStates.map((c, i) => (
                      <span
                        key={i}
                        className={
                          c.state === "correct"   ? "text-foreground"
                          : c.state === "incorrect" ? "text-destructive underline decoration-destructive/60"
                          : c.state === "extra"     ? "text-destructive/80 underline decoration-destructive/60"
                          : c.state === "current"   ? "text-muted-foreground bg-primary/30 rounded-sm animate-pulse"
                          : "text-muted-foreground/50"
                        }
                      >
                        {c.char}
                      </span>
                    ))}
                  </span>
                );
              }

              if (isDone && doneInput !== undefined) {
                return (
                  <span key={absIdx}>
                    {word.split("").map((ch, i) => (
                      <span
                        key={i}
                        className={doneInput[i] === ch ? "text-foreground/80" : "text-destructive/80 underline decoration-destructive/40"}
                      >
                        {ch}
                      </span>
                    ))}
                  </span>
                );
              }

              return (
                <span key={absIdx} className="text-muted-foreground/50">
                  {word}
                </span>
              );
            })}
          </div>

          <input
            ref={hiddenInputRef}
            value={input}
            onChange={() => { /* controlled via keydown only */ }}
            onKeyDown={handleKeyDown}
            className="absolute opacity-0 w-0 h-0 pointer-events-none"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            data-testid="typing-input"
            aria-label="Typing input"
          />
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            onClick={resetTest}
            className="border-border/60 hover:bg-white/5 gap-2"
            data-testid="button-restart"
          >
            <RefreshCw className="w-4 h-4" />
            Restart
          </Button>
          {isStarted && !isFinished && (
            <Button
              onClick={finishTest}
              className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 gap-2"
              data-testid="button-finish"
            >
              <Zap className="w-4 h-4" />
              Finish Early
            </Button>
          )}
        </div>

        <div className="mt-10 flex justify-center">
          <AdBanner size="leaderboard" />
        </div>
      </div>
    </div>
  );
}

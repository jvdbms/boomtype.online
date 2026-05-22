import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Timer, RefreshCw, Zap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateWords, generateCategoryWords } from "@/lib/words";
import { saveLastResult } from "@/lib/storage";
import AdBanner from "@/components/AdBanner";
import VoiceInstructor, { useVoice } from "@/components/VoiceInstructor";

type CharState = "waiting" | "correct" | "incorrect" | "current";

interface CharInfo {
  char: string;
  state: CharState;
}

type TextCategory = "common" | "literature" | "code" | "random";

const CATEGORY_LABELS: Record<TextCategory, string> = {
  common: "Common Words",
  literature: "Literature",
  code: "Code",
  random: "Random",
};

export default function TypingTest() {
  const [, setLocation] = useLocation();
  const [duration, setDuration] = useState<30 | 60>(30);
  const [category, setCategory] = useState<TextCategory>("common");
  const [words, setWords] = useState<string[]>([]);
  const [charStates, setCharStates] = useState<CharInfo[][]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [input, setInput] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [mistakes, setMistakes] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const wordContainerRef = useRef<HTMLDivElement>(null);
  const halfSpokenRef = useRef(false);
  const { speak } = useVoice();

  useEffect(() => {
    document.title = "Typing Speed Test | BoomType — Test Your WPM Free";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Free online typing speed test. Measure your WPM and accuracy in 30s or 60s. Choose from common words, literature, code, and more.");
  }, []);

  const initTest = useCallback(() => {
    const newWords = generateCategoryWords(category, 80);
    setWords(newWords);
    setCharStates(newWords.map(w => [
      ...w.split("").map(c => ({ char: c, state: "waiting" as CharState })),
      { char: " ", state: "waiting" as CharState }
    ]));
    setCurrentWordIndex(0);
    setCurrentCharIndex(0);
    setInput("");
    setIsStarted(false);
    setIsFinished(false);
    setTimeLeft(duration);
    setWpm(0);
    setAccuracy(100);
    setMistakes(0);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    halfSpokenRef.current = false;
  }, [duration, category]);

  useEffect(() => {
    initTest();
  }, [initTest]);

  useEffect(() => {
    if (isStarted && !isFinished) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            finishTest();
            return 0;
          }
          if (prev === Math.floor(duration / 2) && !halfSpokenRef.current) {
            halfSpokenRef.current = true;
            speak(`Halfway there! Keep going!`);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isStarted, isFinished, duration]);

  useEffect(() => {
    if (isStarted && !isFinished) {
      const elapsed = (Date.now() - startTimeRef.current) / 60000;
      const wordsTyped = currentWordIndex + (currentCharIndex / Math.max(words[currentWordIndex]?.length || 1, 1));
      setWpm(elapsed > 0 ? Math.round(wordsTyped / elapsed) : 0);
    }
  }, [currentWordIndex, currentCharIndex, isStarted, isFinished, words]);

  const finishTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsFinished(true);
    const elapsed = (Date.now() - startTimeRef.current) / 60000;
    const finalWpm = elapsed > 0 ? Math.round(currentWordIndex / elapsed) : 0;
    const finalAccuracy = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;
    setWpm(finalWpm);
    setAccuracy(finalAccuracy);
    speak(`Test complete! You scored ${finalWpm} words per minute with ${finalAccuracy} percent accuracy. Excellent!`, true);
    saveLastResult({ wpm: finalWpm, accuracy: finalAccuracy, mistakes, duration });
    setTimeout(() => setLocation("/results"), 1200);
  }, [currentWordIndex, totalKeystrokes, correctKeystrokes, mistakes, duration, setLocation, speak]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isFinished) return;

    if (!isStarted && e.key !== "Tab") {
      setIsStarted(true);
      startTimeRef.current = Date.now();
      speak(`Test started! Go!`, true);
    }

    const currentWord = words[currentWordIndex];
    if (!currentWord) return;
    const wordChars = charStates[currentWordIndex];
    if (!wordChars) return;

    setTotalKeystrokes(prev => prev + 1);

    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (input.length > 0) {
        const isWordCorrect = input === currentWord;
        if (isWordCorrect) {
          setCorrectKeystrokes(prev => prev + 1);
        } else {
          setMistakes(prev => prev + 1);
        }

        setCharStates(prev => {
          const next = prev.map(row => [...row]);
          next[currentWordIndex] = currentWord.split("").map((char, i) => ({
            char,
            state: (input[i] === char ? "correct" : "incorrect") as CharState
          }));
          next[currentWordIndex].push({ char: " ", state: "correct" });
          return next;
        });

        setCurrentWordIndex(prev => {
          const next = prev + 1;
          if (next >= words.length - 5) {
            const moreWords = generateCategoryWords(category, 20);
            setWords(w => [...w, ...moreWords]);
            setCharStates(cs => [...cs, ...moreWords.map(w => [
              ...w.split("").map(c => ({ char: c, state: "waiting" as CharState })),
              { char: " ", state: "waiting" as CharState }
            ])]);
          }
          return next;
        });
        setCurrentCharIndex(0);
        setInput("");
      }
    } else if (e.key === "Backspace") {
      if (input.length > 0) {
        const newInput = input.slice(0, -1);
        setInput(newInput);
        setCurrentCharIndex(newInput.length);
        setCharStates(prev => {
          const next = prev.map(row => [...row]);
          if (next[currentWordIndex]) {
            next[currentWordIndex] = currentWord.split("").map((char, i) => ({
              char,
              state: (
                i < newInput.length ? (newInput[i] === char ? "correct" : "incorrect") :
                i === newInput.length ? "current" :
                "waiting"
              ) as CharState
            }));
            next[currentWordIndex].push({ char: " ", state: "waiting" });
          }
          return next;
        });
      }
    } else if (e.key.length === 1) {
      const newInput = input + e.key;
      setInput(newInput);
      const newCharIdx = newInput.length;
      setCurrentCharIndex(newCharIdx);

      const isCorrect = e.key === currentWord[input.length];
      if (isCorrect) {
        setCorrectKeystrokes(prev => prev + 1);
      } else {
        setMistakes(prev => prev + 1);
      }

      setCharStates(prev => {
        const next = prev.map(row => [...row]);
        if (next[currentWordIndex]) {
          next[currentWordIndex] = currentWord.split("").map((char, i) => ({
            char,
            state: (
              i < newInput.length ? (newInput[i] === char ? "correct" : "incorrect") :
              i === newInput.length ? "current" :
              "waiting"
            ) as CharState
          }));
          next[currentWordIndex].push({ char: " ", state: "waiting" });
        }
        return next;
      });
    }
  }, [isFinished, isStarted, input, currentWordIndex, words, charStates, category, speak]);

  const timerPercent = (timeLeft / duration) * 100;

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
            <div className="flex gap-2">
              {([30, 60] as const).map(d => (
                <Button
                  key={d}
                  variant={duration === d ? "default" : "outline"}
                  onClick={() => { setDuration(d); }}
                  className={`px-6 font-bold ${duration === d ? "bg-primary text-white" : "border-border/60 hover:bg-white/5"}`}
                  data-testid={`button-duration-${d}`}
                >
                  {d}s
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
          onClick={() => inputRef.current?.focus()}
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
            className="font-mono text-xl leading-relaxed select-none flex flex-wrap gap-x-2 gap-y-1"
            style={{ maxHeight: "140px", overflow: "hidden" }}
          >
            {words.slice(Math.max(0, currentWordIndex - 5), currentWordIndex + 30).map((word, relIdx) => {
              const absIdx = relIdx + Math.max(0, currentWordIndex - 5);
              const chars = charStates[absIdx] || word.split("").map(c => ({ char: c, state: "waiting" as CharState }));
              const isCurrentWord = absIdx === currentWordIndex;

              return (
                <span
                  key={absIdx}
                  className={`relative ${isCurrentWord ? "bg-primary/10 rounded px-0.5" : ""}`}
                >
                  {chars.filter(c => c.char !== " ").map((charInfo, charIdx) => (
                    <span
                      key={charIdx}
                      className={`typing-char ${charInfo.state === "correct" ? "correct" : charInfo.state === "incorrect" ? "incorrect" : isCurrentWord && charIdx === currentCharIndex ? "current" : "text-muted-foreground"}`}
                    >
                      {charInfo.char}
                    </span>
                  ))}
                </span>
              );
            })}
          </div>

          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="absolute opacity-0 w-0 h-0 pointer-events-none"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            data-testid="typing-input"
          />
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            onClick={initTest}
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

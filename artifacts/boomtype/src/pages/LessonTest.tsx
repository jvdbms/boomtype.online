import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { Timer, RefreshCw, Zap, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { generateLessonWords } from "@/lib/words";
import { saveLastResult } from "@/lib/storage";
import KeyboardVisualizer from "@/components/KeyboardVisualizer";
import { useVoice } from "@/components/VoiceInstructor";

const LESSONS: Record<number, { title: string; desc: string; duration: 30 | 60; voiceIntro: string }> = {
  1: { title: "Home Row Mastery", desc: "Focus on ASDF and JKL; keys", duration: 30, voiceIntro: "Home row lesson. Keep your fingers on A, S, D, F and J, K, L, semicolon. Start typing when ready." },
  2: { title: "Top Row Speed", desc: "Practice QWERTY and YUIOP", duration: 30, voiceIntro: "Top row lesson. Reach up to the QWERTY and YUIOP keys. Start typing when ready." },
  3: { title: "Number Row Precision", desc: "Conquer numbers without looking", duration: 30, voiceIntro: "Number row lesson. Reach the number row without looking down. Start typing when ready." },
  4: { title: "Speed Drills", desc: "High-frequency common words", duration: 60, voiceIntro: "Speed drill lesson. Type the most common English words as fast as you can. Start typing when ready." },
  5: { title: "Advanced Punctuation", desc: "Commas, semicolons, quotes, and more", duration: 60, voiceIntro: "Punctuation lesson. Focus on commas, semicolons, and special characters. Start typing when ready." },
  6: { title: "Code Typing", desc: "Brackets, symbols, code patterns", duration: 60, voiceIntro: "Code typing lesson. Practice brackets, braces, and programming symbols. Start typing when ready." },
  7: { title: "Bottom Row Basics", desc: "Master ZXCV and BNM keys", duration: 30, voiceIntro: "Bottom row lesson. Practice Z, X, C, V, B, N, M keys with your lower fingers. Start typing when ready." },
};

type CharState = "waiting" | "correct" | "incorrect" | "current";

interface CharInfo {
  char: string;
  state: CharState;
}

export default function LessonTest() {
  const params = useParams<{ id: string }>();
  const lessonId = parseInt(params.id || "1", 10);
  const lesson = LESSONS[lessonId];
  const [, setLocation] = useLocation();
  const duration = lesson?.duration || 30;
  const { speak } = useVoice();

  const [words, setWords] = useState<string[]>([]);
  const [charStates, setCharStates] = useState<CharInfo[][]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [input, setInput] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [mistakes, setMistakes] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [nextKey, setNextKey] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const halfSpokenRef = useRef(false);

  const initTest = useCallback(() => {
    const newWords = generateLessonWords(lessonId, 80);
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
    if (newWords[0]) setNextKey(newWords[0][0] || "");
  }, [lessonId, duration]);

  useEffect(() => { initTest(); }, [initTest]);

  useEffect(() => {
    if (lesson) {
      speak(lesson.voiceIntro);
    }
  }, [lessonId]);

  useEffect(() => {
    if (isStarted && !isFinished) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { finishTest(); return 0; }
          if (prev === Math.floor(duration / 2) && !halfSpokenRef.current) {
            halfSpokenRef.current = true;
            speak("Halfway there! Keep going!");
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isStarted, isFinished]);

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
    speak(`Lesson complete! You scored ${finalWpm} words per minute with ${finalAccuracy} percent accuracy!`, true);
    saveLastResult({ wpm: finalWpm, accuracy: finalAccuracy, mistakes, duration });
    setTimeout(() => setLocation("/results"), 1200);
  }, [currentWordIndex, totalKeystrokes, correctKeystrokes, mistakes, duration, setLocation, speak]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isFinished) return;
    if (!isStarted && e.key !== "Tab") {
      setIsStarted(true);
      startTimeRef.current = Date.now();
      speak("Go!", true);
    }

    const currentWord = words[currentWordIndex];
    if (!currentWord) return;

    setTotalKeystrokes(prev => prev + 1);

    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (input.length > 0) {
        const isWordCorrect = input === currentWord;
        if (isWordCorrect) setCorrectKeystrokes(prev => prev + 1);
        else setMistakes(prev => prev + 1);

        setCharStates(prev => {
          const next = prev.map(row => [...row]);
          next[currentWordIndex] = currentWord.split("").map((char, i) => ({
            char,
            state: (input[i] === char ? "correct" : "incorrect") as CharState,
          }));
          next[currentWordIndex].push({ char: " ", state: "correct" });
          return next;
        });

        setCurrentWordIndex(prev => {
          const next = prev + 1;
          if (next >= words.length - 5) {
            const more = generateLessonWords(lessonId, 20);
            setWords(w => [...w, ...more]);
            setCharStates(cs => [...cs, ...more.map(w => [
              ...w.split("").map(c => ({ char: c, state: "waiting" as CharState })),
              { char: " ", state: "waiting" as CharState },
            ])]);
          }
          const nextWord = words[next];
          setNextKey(nextWord ? (nextWord[0] || "") : "");
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
        setNextKey(currentWord[newInput.length] || " ");
        setCharStates(prev => {
          const next = prev.map(row => [...row]);
          if (next[currentWordIndex]) {
            next[currentWordIndex] = currentWord.split("").map((char, i) => ({
              char,
              state: (
                i < newInput.length ? (newInput[i] === char ? "correct" : "incorrect") :
                i === newInput.length ? "current" : "waiting"
              ) as CharState,
            }));
            next[currentWordIndex].push({ char: " ", state: "waiting" });
          }
          return next;
        });
      }
    } else if (e.key.length === 1) {
      const newInput = input + e.key;
      setInput(newInput);
      setCurrentCharIndex(newInput.length);
      setNextKey(currentWord[newInput.length] || " ");
      const isCorrect = e.key === currentWord[input.length];
      if (isCorrect) setCorrectKeystrokes(prev => prev + 1);
      else setMistakes(prev => prev + 1);
      setCharStates(prev => {
        const next = prev.map(row => [...row]);
        if (next[currentWordIndex]) {
          next[currentWordIndex] = currentWord.split("").map((char, i) => ({
            char,
            state: (
              i < newInput.length ? (newInput[i] === char ? "correct" : "incorrect") :
              i === newInput.length ? "current" : "waiting"
            ) as CharState,
          }));
          next[currentWordIndex].push({ char: " ", state: "waiting" });
        }
        return next;
      });
    }
  }, [isFinished, isStarted, input, currentWordIndex, words, lessonId, speak]);

  const timerPercent = (timeLeft / duration) * 100;

  useEffect(() => {
    document.title = `${lesson?.title || "Lesson"} | BoomType`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && lesson) meta.setAttribute("content", `${lesson.title} — ${lesson.desc}. Practice typing on BoomType.`);
  }, [lesson]);

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Lesson not found.</p>
          <Link href="/lessons"><Button>Back to Lessons</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/lessons" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Lessons
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-3">
            Lesson {lessonId}
          </div>
          <h1 className="text-3xl font-black mb-1">{lesson.title}</h1>
          <p className="text-muted-foreground">{lesson.desc}</p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mb-6">
          <div className="text-center">
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-1">
              <Timer className="w-4 h-4" />
              Time
            </div>
            <div className={`text-5xl font-black tabular-nums ${timeLeft <= 10 && isStarted ? "text-destructive" : "text-primary"}`}>
              {timeLeft}
            </div>
          </div>
          <div className="w-px h-16 bg-border/60" />
          <div className="text-center">
            <div className="text-muted-foreground text-sm mb-1">WPM</div>
            <div className="text-5xl font-black tabular-nums gradient-text">{wpm}</div>
          </div>
          <div className="w-px h-16 bg-border/60" />
          <div className="text-center">
            <div className="text-muted-foreground text-sm mb-1">Accuracy</div>
            <div className="text-5xl font-black tabular-nums">
              {accuracy}<span className="text-2xl text-muted-foreground">%</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-border/40 rounded-full mb-6 overflow-hidden">
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
        >
          {!isStarted && !isFinished && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-card/50 backdrop-blur-sm z-10">
              <div className="text-center">
                <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-lg font-bold">Click here to start</p>
                <p className="text-sm text-muted-foreground mt-1">Then start typing the words!</p>
              </div>
            </div>
          )}

          <div
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
                      className={`typing-char ${
                        charInfo.state === "correct" ? "correct" :
                        charInfo.state === "incorrect" ? "incorrect" :
                        isCurrentWord && charIdx === currentCharIndex ? "current" :
                        "text-muted-foreground"
                      }`}
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
          />
        </div>

        {/* Keyboard Visualizer — shows next key during active typing */}
        <div className="mb-6">
          <KeyboardVisualizer highlightKey={isStarted && !isFinished ? nextKey : undefined} />
        </div>

        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            onClick={initTest}
            className="border-border/60 hover:bg-white/5 gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Restart
          </Button>
          {isStarted && !isFinished && (
            <Button
              onClick={finishTest}
              className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 gap-2"
            >
              <Zap className="w-4 h-4" />
              Finish Early
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw, Zap, ArrowLeft, ChevronRight, Trophy,
  Mic, MicOff, Volume2, CheckCircle2, Target,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { generateLessonWords } from "@/lib/words";
import { saveLastResult, addXP } from "@/lib/storage";
import KeyboardVisualizer from "@/components/KeyboardVisualizer";
import { useVoice } from "@/components/VoiceInstructor";

const LESSONS: Record<number, {
  title: string;
  desc: string;
  tip: string;
  voiceIntro: string;
  icon: string;
  color: string;
  focusKeys: string;
  xpReward: number;
  goalWords: number;
  nextId?: number;
}> = {
  1: {
    title: "Home Row Mastery",
    desc: "A S D F — J K L ; are your home keys",
    tip: "Keep all fingers resting lightly on the home row between keystrokes. Never look at your hands!",
    voiceIntro: "Home row lesson. Rest your fingers on A, S, D, F and J, K, L, semicolon. Type each word then press Space.",
    icon: "🏠", color: "from-green-500 to-emerald-600",
    focusKeys: "a s d f g h j k l", xpReward: 50, goalWords: 30, nextId: 2,
  },
  2: {
    title: "Top Row Speed",
    desc: "Q W E R T — Y U I O P — reach up without looking",
    tip: "Your home row fingers reach up to the top row. Always return to home row after each keystroke.",
    voiceIntro: "Top row lesson. Reach up to Q W E R T Y U I O P. Always return your fingers to home row.",
    icon: "⬆️", color: "from-blue-500 to-cyan-600",
    focusKeys: "q w e r t y u i o p", xpReward: 60, goalWords: 30, nextId: 7,
  },
  3: {
    title: "Number Row Precision",
    desc: "1 2 3 4 5 — 6 7 8 9 0 — reach up without peeking",
    tip: "Each number key has a designated finger. Pinky = 1, Ring = 2, Middle = 3, Index = 4 & 5.",
    voiceIntro: "Number row! Reach your fingers up to the number keys. Try not to look down.",
    icon: "🔢", color: "from-yellow-500 to-amber-600",
    focusKeys: "1 2 3 4 5 6 7 8 9 0", xpReward: 75, goalWords: 25, nextId: 4,
  },
  4: {
    title: "Speed Drills",
    desc: "The 80 most common English words — build speed and rhythm",
    tip: "See words as shapes, not individual letters. Don't think — just let your fingers flow!",
    voiceIntro: "Speed drill! Type common words as fast as you can. Focus on rhythm, not individual letters.",
    icon: "⚡", color: "from-orange-500 to-red-600",
    focusKeys: "all keys", xpReward: 100, goalWords: 40, nextId: 5,
  },
  5: {
    title: "Advanced Punctuation",
    desc: "Commas · Periods · Apostrophes · Semicolons · ! ?",
    tip: "Use your right pinky for most punctuation. Apostrophe is just left of Enter.",
    voiceIntro: "Punctuation lesson. Practice commas, periods, apostrophes, and special characters.",
    icon: "✍️", color: "from-purple-500 to-violet-600",
    focusKeys: ", . ; : ' \" ! ?", xpReward: 120, goalWords: 30, nextId: 6,
  },
  6: {
    title: "Code Typing",
    desc: "Brackets · Braces · Symbols used in programming",
    tip: "Stretch your fingers to reach symbol keys — never move your whole hand off the home position.",
    voiceIntro: "Code typing lesson. Practice brackets, braces, and symbols used in programming.",
    icon: "💻", color: "from-pink-500 to-rose-600",
    focusKeys: "{ } [ ] ( ) = + - _ /", xpReward: 150, goalWords: 30, nextId: undefined,
  },
  7: {
    title: "Bottom Row Basics",
    desc: "Z X C V B — N M , . / — reach down confidently",
    tip: "Curl your fingers slightly to reach the bottom row. Always return to home row after.",
    voiceIntro: "Bottom row lesson. Practice Z, X, C, V, B, N, M. Curl your fingers to reach down.",
    icon: "⬇️", color: "from-teal-500 to-cyan-600",
    focusKeys: "z x c v b n m", xpReward: 60, goalWords: 30, nextId: 3,
  },
};

const COMPLETED_KEY = "boomtype_completed_lessons";
function getCompleted(): number[] {
  try { return JSON.parse(localStorage.getItem(COMPLETED_KEY) || "[]"); } catch { return []; }
}
function markCompleted(id: number) {
  try {
    const prev = getCompleted();
    if (!prev.includes(id)) localStorage.setItem(COMPLETED_KEY, JSON.stringify([...prev, id]));
  } catch {}
}

export default function LessonTest() {
  const params = useParams<{ id: string }>();
  const lessonId = parseInt(params.id || "1", 10);
  const lesson = LESSONS[lessonId];
  const { speak, enabled: voiceEnabled, gender, toggleEnabled: toggleVoice, toggleGender } = useVoice();

  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [input, setInput] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [totalMistakes, setTotalMistakes] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [alreadyDone, setAlreadyDone] = useState(false);
  // Flash feedback when word is submitted
  const [wordFlash, setWordFlash] = useState<"correct" | "wrong" | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const goalWords = lesson?.goalWords || 30;

  const initTest = useCallback(() => {
    if (!lesson) return;
    const newWords = generateLessonWords(lessonId, goalWords + 15);
    setWords(newWords);
    setCurrentWordIndex(0);
    setInput("");
    setIsStarted(false);
    setIsFinished(false);
    setShowResults(false);
    setElapsedSec(0);
    setWpm(0);
    setAccuracy(100);
    setTotalMistakes(0);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setWordsCompleted(0);
    setWordFlash(null);
  }, [lessonId, lesson, goalWords]);

  useEffect(() => { initTest(); }, [initTest]);
  useEffect(() => {
    if (lesson) {
      speak(lesson.voiceIntro);
      setAlreadyDone(getCompleted().includes(lessonId));
    }
  }, [lessonId]);

  // Elapsed timer (counts UP — no pressure)
  useEffect(() => {
    if (isStarted && !isFinished) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedSec(elapsed);
        const elapsedMin = elapsed / 60;
        setWpm(elapsedMin > 0 ? Math.round(wordsCompleted / elapsedMin) : 0);
      }, 500);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isStarted, isFinished, wordsCompleted]);

  const finishTest = useCallback((wc: number, ck: number, tk: number, mis: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsFinished(true);
    const elapsedMin = (Date.now() - startTimeRef.current) / 60000;
    const finalWpm = elapsedMin > 0 ? Math.round(wc / elapsedMin) : 0;
    const finalAcc = tk > 0 ? Math.round((ck / tk) * 100) : 100;
    setWpm(finalWpm);
    setAccuracy(finalAcc);
    speak(`Lesson complete! ${finalWpm} words per minute, ${finalAcc} percent accuracy. Great work!`, true);
    saveLastResult({ wpm: finalWpm, accuracy: finalAcc, mistakes: mis, duration: Math.round((Date.now() - startTimeRef.current) / 1000) });
    markCompleted(lessonId);
    addXP(lesson?.xpReward || 50);
    setTimeout(() => setShowResults(true), 400);
  }, [lessonId, lesson, speak]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isFinished) return;

    if (!isStarted && e.key !== "Tab" && e.key !== "Shift" && e.key !== "CapsLock") {
      setIsStarted(true);
      startTimeRef.current = Date.now();
    }

    const currentWord = words[currentWordIndex];
    if (!currentWord) return;

    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (input.trim().length === 0) return;

      const isCorrect = input === currentWord;
      const newTk = totalKeystrokes + input.length + 1;
      const newCk = correctKeystrokes + (isCorrect ? input.length + 1 : 0);
      const newMis = isCorrect ? totalMistakes : totalMistakes + 1;
      const newWc = wordsCompleted + 1;

      setTotalKeystrokes(newTk);
      setCorrectKeystrokes(newCk);
      setTotalMistakes(newMis);
      setWordsCompleted(newWc);

      // Flash green or red feedback briefly
      setWordFlash(isCorrect ? "correct" : "wrong");
      setTimeout(() => setWordFlash(null), 350);

      if (newWc >= goalWords) {
        finishTest(newWc, newCk, newTk, newMis);
        return;
      }

      setCurrentWordIndex(prev => prev + 1);
      setInput("");
    } else if (e.key === "Backspace") {
      setInput(prev => prev.slice(0, -1));
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      const newInput = input + e.key;
      setInput(newInput);
      setTotalKeystrokes(prev => prev + 1);
      if (e.key === currentWord[input.length]) {
        setCorrectKeystrokes(prev => prev + 1);
      }
    }
  }, [isFinished, isStarted, input, currentWordIndex, words, wordsCompleted,
      goalWords, correctKeystrokes, totalMistakes, totalKeystrokes, finishTest]);

  useEffect(() => {
    document.title = `${lesson?.title || "Lesson"} | BoomType`;
  }, [lesson]);

  if (!lesson) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground mb-4">Lesson not found.</p>
        <Link href="/lessons"><Button>Back to Lessons</Button></Link>
      </div>
    </div>
  );

  const nextLesson = lesson.nextId ? LESSONS[lesson.nextId] : null;
  const progressPct = Math.min((wordsCompleted / goalWords) * 100, 100);
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  const currentWord = words[currentWordIndex] || "";
  const upcomingWords = words.slice(currentWordIndex + 1, currentWordIndex + 7);
  const nextChar = currentWord[input.length] || "";

  return (
    <div className="min-h-screen py-6 px-4 relative">

      {/* ── Results overlay ───────────────────────────────── */}
      <AnimatePresence>
        {showResults && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xl px-4"
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.3 }}
              className="rounded-3xl bg-card border border-border/60 p-8 max-w-md w-full text-center shadow-2xl"
            >
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${lesson.color} flex items-center justify-center text-4xl mx-auto mb-5 shadow-lg`}>
                {lesson.icon}
              </div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Lesson Complete!</div>
              <h2 className="text-2xl font-black mb-1">{lesson.title}</h2>
              <div className="flex items-center justify-center gap-1.5 text-yellow-400 text-sm font-bold mb-6">
                <Trophy className="w-4 h-4" />+{lesson.xpReward} XP earned
              </div>
              <div className="grid grid-cols-4 gap-2 mb-6">
                {[
                  { v: wpm,                  label: "WPM",      c: "text-primary"         },
                  { v: `${accuracy}%`,        label: "Accuracy", c: "text-green-400"       },
                  { v: totalMistakes,         label: "Mistakes", c: "text-red-400"         },
                  { v: formatTime(elapsedSec),label: "Time",     c: "text-muted-foreground"},
                ].map(({ v, label, c }) => (
                  <div key={label} className="rounded-xl bg-white/5 border border-border/40 p-2.5">
                    <div className={`text-xl font-black ${c}`}>{v}</div>
                    <div className="text-[10px] text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2.5">
                {nextLesson && (
                  <Link href={`/lessons/${lesson.nextId}`}>
                    <Button className={`w-full bg-gradient-to-r ${lesson.color} text-white font-black gap-2 py-4 h-auto text-sm hover:opacity-90 shadow-lg`}>
                      <ChevronRight className="w-4 h-4" />Next: {nextLesson.title}
                    </Button>
                  </Link>
                )}
                {!nextLesson && (
                  <Link href="/lessons">
                    <Button className="w-full bg-gradient-to-r from-primary to-accent text-white font-black gap-2 py-4 h-auto hover:opacity-90">
                      <Trophy className="w-4 h-4" />All Lessons Complete! 🏆
                    </Button>
                  </Link>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 border-border/60 hover:bg-white/5 gap-1.5" onClick={initTest}>
                    <RefreshCw className="w-4 h-4" />Retry
                  </Button>
                  <Link href="/dashboard" className="flex-1">
                    <Button variant="outline" className="w-full border-border/60 hover:bg-white/5 gap-1.5">
                      Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto">

        {/* ── Top bar ─────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5">
          <Link href="/lessons" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Lessons
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={toggleVoice}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                voiceEnabled
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-card border-border/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {voiceEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              Coach
            </button>
            {voiceEnabled && (
              <button onClick={toggleGender}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-accent/10 border-accent/30 text-accent text-xs font-semibold hover:bg-accent/20 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" />
                {gender === "female" ? "♀ Female" : "♂ Male"}
              </button>
            )}
          </div>
        </div>

        {/* ── Lesson header ────────────────────────────────── */}
        <div className="flex items-start gap-4 mb-4 rounded-2xl bg-card border border-border/60 p-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${lesson.color} flex items-center justify-center text-2xl shrink-0 shadow-lg`}>
            {lesson.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-lg font-black">{lesson.title}</h1>
              {alreadyDone && <CheckCircle2 className="w-4 h-4 text-green-400" />}
            </div>
            <p className="text-sm text-muted-foreground mb-1">{lesson.desc}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                Keys: <span className="font-mono font-bold text-foreground ml-1">{lesson.focusKeys}</span>
              </span>
              <span className="text-border/50">·</span>
              <span className="text-yellow-400 font-bold">+{lesson.xpReward} XP</span>
              <span className="text-border/50">·</span>
              <span>Goal: {goalWords} words</span>
            </div>
          </div>
        </div>

        {/* ── Tip ──────────────────────────────────────────── */}
        <div className="rounded-xl bg-primary/5 border border-primary/15 px-4 py-2.5 mb-4 flex items-start gap-2">
          <span className="text-base shrink-0">💡</span>
          <span className="text-sm text-muted-foreground">{lesson.tip}</span>
        </div>

        {/* ── Stats row ────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: "Words",    value: `${wordsCompleted}/${goalWords}`, color: "text-primary"          },
            { label: "WPM",      value: wpm,                              color: "text-accent"            },
            { label: "Accuracy", value: `${accuracy}%`,                  color: accuracy >= 90 ? "text-green-400" : accuracy >= 70 ? "text-yellow-400" : "text-red-400" },
            { label: "Time",     value: formatTime(elapsedSec),           color: "text-muted-foreground"  },
          ].map(s => (
            <div key={s.label} className="rounded-xl bg-card border border-border/60 p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
              <div className={`text-xl font-black tabular-nums ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* ── Progress bar ─────────────────────────────────── */}
        <div className="mb-5">
          <div className="h-2.5 bg-border/25 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${lesson.color}`}
              style={{ width: `${progressPct}%` }}
              transition={{ type: "spring", stiffness: 80 }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground/40 mt-1 px-0.5">
            {[0, Math.round(goalWords * 0.25), Math.round(goalWords * 0.5), Math.round(goalWords * 0.75), goalWords].map(n => (
              <span key={n} className={wordsCompleted >= n && n > 0 ? "text-primary/60" : ""}>{n}</span>
            ))}
          </div>
        </div>

        {/* ── MAIN PRACTICE AREA ───────────────────────────── */}
        <div
          className={`
            relative rounded-2xl border p-6 mb-5 cursor-text transition-all duration-200
            ${wordFlash === "correct" ? "bg-green-500/8 border-green-500/40" :
              wordFlash === "wrong"   ? "bg-red-500/8 border-red-500/40" :
              "bg-card border-border/60"}
          `}
          onClick={() => inputRef.current?.focus()}
        >
          {/* Not-started overlay */}
          {!isStarted && !isFinished && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-card/90 backdrop-blur-sm z-10">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${lesson.color} flex items-center justify-center text-2xl mb-3 shadow-lg`}>
                {lesson.icon}
              </div>
              <p className="text-xl font-black">Click here to start</p>
              <p className="text-sm text-muted-foreground mt-1">No time limit · Practice at your own pace</p>
            </div>
          )}

          {/* ── Upcoming words preview ─ */}
          <div className="flex gap-2 flex-wrap justify-center min-h-[28px] mb-6">
            {upcomingWords.map((w, i) => (
              <span key={i}
                className={`font-mono text-sm px-2 py-0.5 rounded-lg transition-opacity ${
                  i === 0 ? "text-muted-foreground/70 bg-white/5" : "text-muted-foreground/30"
                }`}
              >{w}</span>
            ))}
          </div>

          {/* ── Current word — BIG ─────── */}
          <div className="flex items-center justify-center gap-0.5 flex-wrap min-h-[64px] mb-4">
            {currentWord.split("").map((char, i) => {
              const isTyped = i < input.length;
              const isCorrect = input[i] === char;
              const isCursor = i === input.length;
              return (
                <span key={i} className="relative inline-flex">
                  {/* Blinking cursor before untyped char */}
                  {isCursor && isStarted && !isFinished && (
                    <span className="absolute -left-0.5 inset-y-1 w-0.5 bg-primary rounded-full animate-pulse" />
                  )}
                  <span className={`
                    font-mono font-black select-none transition-colors duration-75
                    ${currentWord.length > 12 ? "text-3xl" : currentWord.length > 8 ? "text-4xl" : "text-5xl"}
                    ${isTyped
                      ? isCorrect
                        ? "text-green-400"   /* ✓ Correct — GREEN */
                        : "text-red-400"     /* ✗ Wrong   — RED   */
                      : "text-foreground/80" /* Not yet typed     */
                    }
                  `}>{char}</span>
                </span>
              );
            })}
            {/* End-of-word cursor */}
            {isStarted && !isFinished && input.length === currentWord.length && (
              <span className="w-0.5 h-10 bg-primary rounded-full animate-pulse self-center ml-1" />
            )}
          </div>

          {/* ── Sub-hint ───────────────── */}
          <div className="text-center min-h-[20px]">
            {isStarted && !isFinished ? (
              <p className="text-xs text-muted-foreground/50">
                {input.length === 0
                  ? "Type the word above"
                  : input.length < currentWord.length
                    ? <span>Press <kbd className="px-1 py-0.5 rounded bg-white/8 text-[10px] font-mono">Backspace</kbd> to correct</span>
                    : <span>Press <kbd className="px-1 py-0.5 rounded bg-white/8 text-[10px] font-mono">Space</kbd> or <kbd className="px-1 py-0.5 rounded bg-white/8 text-[10px] font-mono">Enter</kbd> to continue</span>
                }
              </p>
            ) : (
              <p className="text-xs text-muted-foreground/30">
                {!isStarted ? "Practice at your own pace — no time limit" : ""}
              </p>
            )}
          </div>

          {/* Hidden real input */}
          <input
            ref={inputRef}
            value={input}
            onChange={() => {}}
            onKeyDown={handleKeyDown}
            className="absolute opacity-0 w-0 h-0 pointer-events-none"
            autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
          />
        </div>

        {/* ── Keyboard with animated finger guide ──────────── */}
        <KeyboardVisualizer
          highlightKey={isStarted && !isFinished ? nextChar : undefined}
          showFingerGuide={true}
        />

        {/* ── Controls ─────────────────────────────────────── */}
        <div className="flex flex-wrap justify-center gap-3 mt-5">
          <Button variant="outline" onClick={initTest} className="border-border/60 hover:bg-white/5 gap-2">
            <RefreshCw className="w-4 h-4" />Restart
          </Button>
          {isStarted && !isFinished && (
            <Button
              onClick={() => finishTest(wordsCompleted, correctKeystrokes, totalKeystrokes, totalMistakes)}
              className="bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 gap-2"
            >
              <Zap className="w-4 h-4" />Finish Early
            </Button>
          )}
          {nextLesson && (
            <Link href={`/lessons/${lesson.nextId}`}>
              <Button variant="outline" className="border-border/60 hover:bg-white/5 gap-2 text-muted-foreground">
                Skip to next <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}

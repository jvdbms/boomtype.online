import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Zap, ArrowLeft, ChevronRight, Trophy, Mic, MicOff, Volume2, CheckCircle2, Target } from "lucide-react";
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
    title: "Home Row Mastery",      desc: "ASDF and JKL; — the foundation of every fast typist",
    tip: "Keep fingers resting on the home row between keystrokes.",
    voiceIntro: "Home row lesson. Rest your fingers on A, S, D, F and J, K, L, semicolon. Type each word then press Space.",
    icon: "🏠", color: "from-green-500 to-emerald-600",  focusKeys: "asdf jkl;", xpReward: 50,  goalWords: 30, nextId: 2,
  },
  2: {
    title: "Top Row Speed",         desc: "QWERTY and YUIOP — reach up without looking",
    tip: "Keep pinkies anchored on Q and P as you reach the top row.",
    voiceIntro: "Top row lesson. Reach up to Q W E R T Y and U I O P. Keep your home row as your base.",
    icon: "⬆️", color: "from-blue-500 to-cyan-600",      focusKeys: "qwerty yuiop", xpReward: 60,  goalWords: 30, nextId: 7,
  },
  3: {
    title: "Number Row Precision",  desc: "Conquer digits 1–0 without peeking",
    tip: "Each number has a designated finger — never guess, remember the pattern.",
    voiceIntro: "Number row! Reach up to the digit keys. Try not to look down. Press Space after each word.",
    icon: "🔢", color: "from-yellow-500 to-amber-600",   focusKeys: "1234567890", xpReward: 75,  goalWords: 25, nextId: 4,
  },
  4: {
    title: "Speed Drills",          desc: "Most common English words — build rhythm",
    tip: "Don't think about individual letters — see words as shapes.",
    voiceIntro: "Speed drill! Type common words as fast as you can. Focus on rhythm, not individual letters.",
    icon: "⚡", color: "from-orange-500 to-red-600",     focusKeys: "all keys",   xpReward: 100, goalWords: 40, nextId: 5,
  },
  5: {
    title: "Advanced Punctuation",  desc: "Commas, semicolons, quotes and more",
    tip: "Use your right pinky for most punctuation keys.",
    voiceIntro: "Punctuation lesson. Practice commas, semicolons, and special characters.",
    icon: "✍️", color: "from-purple-500 to-violet-600",  focusKeys: ",;:\"'!?",  xpReward: 120, goalWords: 30, nextId: 6,
  },
  6: {
    title: "Code Typing",           desc: "Brackets, symbols and code patterns",
    tip: "Stretch your fingers rather than moving your whole hand.",
    voiceIntro: "Code typing lesson. Practice brackets, braces, and symbols used in programming.",
    icon: "💻", color: "from-pink-500 to-rose-600",     focusKeys: "{}[]()<>",  xpReward: 150, goalWords: 30, nextId: undefined,
  },
  7: {
    title: "Bottom Row Basics",     desc: "ZXCV and BNM — reach down confidently",
    tip: "Curl fingers slightly to reach the bottom row from the home position.",
    voiceIntro: "Bottom row lesson. Practice Z, X, C, V, B, N, M with your lower fingers.",
    icon: "⬇️", color: "from-teal-500 to-cyan-600",    focusKeys: "zxcvbnm",    xpReward: 60,  goalWords: 30, nextId: 3,
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

type CharState = "waiting" | "correct" | "incorrect" | "current";
interface CharInfo { char: string; state: CharState; }

export default function LessonTest() {
  const params = useParams<{ id: string }>();
  const lessonId = parseInt(params.id || "1", 10);
  const lesson = LESSONS[lessonId];
  const { speak, enabled: voiceEnabled, gender, toggleEnabled: toggleVoice, toggleGender } = useVoice();

  const [words, setWords] = useState<string[]>([]);
  const [charStates, setCharStates] = useState<CharInfo[][]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [input, setInput] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [mistakes, setMistakes] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [nextKey, setNextKey] = useState<string>("");
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const goalWords = lesson?.goalWords || 30;

  const initTest = useCallback(() => {
    if (!lesson) return;
    const newWords = generateLessonWords(lessonId, goalWords + 10);
    setWords(newWords);
    setCharStates(newWords.map(w => [
      ...w.split("").map(c => ({ char: c, state: "waiting" as CharState })),
      { char: " ", state: "waiting" as CharState },
    ]));
    setCurrentWordIndex(0);
    setCurrentCharIndex(0);
    setInput("");
    setIsStarted(false);
    setIsFinished(false);
    setShowResults(false);
    setElapsedSec(0);
    setWpm(0);
    setAccuracy(100);
    setMistakes(0);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setWordsCompleted(0);
    if (newWords[0]) setNextKey(newWords[0][0] || "");
  }, [lessonId, lesson, goalWords]);

  useEffect(() => { initTest(); }, [initTest]);
  useEffect(() => { if (lesson) { speak(lesson.voiceIntro); setAlreadyDone(getCompleted().includes(lessonId)); } }, [lessonId]);

  // Elapsed timer (counts UP — no pressure!)
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
    const finalAccuracy = tk > 0 ? Math.round((ck / tk) * 100) : 100;
    setWpm(finalWpm);
    setAccuracy(finalAccuracy);
    speak(`Lesson complete! ${finalWpm} words per minute, ${finalAccuracy} percent accuracy. Great work!`, true);
    saveLastResult({ wpm: finalWpm, accuracy: finalAccuracy, mistakes: mis, duration: Math.round((Date.now() - startTimeRef.current) / 1000) });
    markCompleted(lessonId);
    addXP(lesson?.xpReward || 50);
    setTimeout(() => setShowResults(true), 300);
  }, [lessonId, lesson, speak]);

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
        const newCorrectKs = isWordCorrect ? correctKeystrokes + 1 : correctKeystrokes;
        const newMistakes = isWordCorrect ? mistakes : mistakes + 1;
        const newWc = wordsCompleted + 1;
        setCorrectKeystrokes(newCorrectKs);
        setMistakes(newMistakes);
        setWordsCompleted(newWc);
        setCharStates(prev => {
          const next = prev.map(row => [...row]);
          next[currentWordIndex] = [
            ...currentWord.split("").map((char, i) => ({ char, state: (input[i] === char ? "correct" : "incorrect") as CharState })),
            { char: " ", state: "correct" as CharState },
          ];
          return next;
        });
        if (newWc >= goalWords) {
          finishTest(newWc, newCorrectKs, totalKeystrokes + 1, newMistakes);
          return;
        }
        const nextIdx = currentWordIndex + 1;
        setCurrentWordIndex(nextIdx);
        setNextKey(words[nextIdx]?.[0] || "");
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
            next[currentWordIndex] = [
              ...currentWord.split("").map((char, i) => ({
                char,
                state: (i < newInput.length ? (newInput[i] === char ? "correct" : "incorrect") : i === newInput.length ? "current" : "waiting") as CharState,
              })),
              { char: " ", state: "waiting" as CharState },
            ];
          }
          return next;
        });
      }
    } else if (e.key.length === 1) {
      const newInput = input + e.key;
      setInput(newInput);
      setCurrentCharIndex(newInput.length);
      setNextKey(currentWord[newInput.length] || " ");
      if (e.key === currentWord[input.length]) setCorrectKeystrokes(prev => prev + 1);
      else setMistakes(prev => prev + 1);
      setCharStates(prev => {
        const next = prev.map(row => [...row]);
        if (next[currentWordIndex]) {
          next[currentWordIndex] = [
            ...currentWord.split("").map((char, i) => ({
              char,
              state: (i < newInput.length ? (newInput[i] === char ? "correct" : "incorrect") : i === newInput.length ? "current" : "waiting") as CharState,
            })),
            { char: " ", state: "waiting" as CharState },
          ];
        }
        return next;
      });
    }
  }, [isFinished, isStarted, input, currentWordIndex, words, wordsCompleted, goalWords, correctKeystrokes, mistakes, totalKeystrokes, finishTest, speak]);

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

  return (
    <div className="min-h-screen py-6 px-4 relative">
      {/* Results overlay */}
      <AnimatePresence>
        {showResults && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xl px-4"
          >
            <motion.div initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", bounce: 0.3 }}
              className="rounded-3xl bg-card border border-border/60 p-8 max-w-md w-full text-center shadow-2xl"
            >
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${lesson.color} flex items-center justify-center text-4xl mx-auto mb-5 shadow-lg`}>
                {lesson.icon}
              </div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Lesson Complete!</div>
              <h2 className="text-2xl font-black mb-1">{lesson.title}</h2>
              <div className="flex items-center justify-center gap-1.5 text-yellow-400 text-sm font-bold mb-6">
                <Trophy className="w-4 h-4" />+{lesson.xpReward} XP earned
              </div>
              <div className="grid grid-cols-4 gap-2 mb-6">
                {[
                  { v: wpm,           label: "WPM",      c: "text-primary" },
                  { v: `${accuracy}%`,label: "Accuracy", c: "text-green-400" },
                  { v: mistakes,      label: "Mistakes", c: "text-orange-400" },
                  { v: formatTime(elapsedSec), label: "Time", c: "text-muted-foreground" },
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
                      <ChevronRight className="w-4 h-4" />
                      Next: {nextLesson.title}
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

      <div className="max-w-3xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <Link href="/lessons" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />Lessons
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={toggleVoice}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${voiceEnabled ? "bg-primary/10 border-primary/30 text-primary" : "bg-card border-border/50 text-muted-foreground hover:text-foreground"}`}
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

        {/* Lesson header */}
        <div className="flex items-start gap-4 mb-5 rounded-2xl bg-card border border-border/60 p-5">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${lesson.color} flex items-center justify-center text-2xl shrink-0 shadow-lg`}>
            {lesson.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-xl font-black">{lesson.title}</h1>
              {alreadyDone && <CheckCircle2 className="w-4 h-4 text-green-400" />}
            </div>
            <p className="text-sm text-muted-foreground mb-2">{lesson.desc}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><Target className="w-3 h-3" />Focus: <span className="font-mono font-bold text-foreground">{lesson.focusKeys}</span></span>
              <span className="text-border/60">·</span>
              <span className="text-yellow-400 font-bold">+{lesson.xpReward} XP on completion</span>
              <span className="text-border/60">·</span>
              <span>Goal: {goalWords} words</span>
              {nextLesson && (
                <><span className="text-border/60">·</span>
                <span>Next: {nextLesson.icon} {nextLesson.title}</span></>
              )}
            </div>
          </div>
        </div>

        {/* Tip */}
        <div className="rounded-xl bg-primary/5 border border-primary/15 px-4 py-2.5 mb-4 flex items-start gap-2">
          <span className="text-primary text-sm font-bold shrink-0">💡 Tip:</span>
          <span className="text-sm text-muted-foreground">{lesson.tip}</span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="rounded-xl bg-card border border-border/60 p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">Words</div>
            <div className="text-2xl font-black text-primary tabular-nums">{wordsCompleted}</div>
            <div className="text-xs text-muted-foreground">/ {goalWords}</div>
          </div>
          <div className="rounded-xl bg-card border border-border/60 p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">WPM</div>
            <div className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tabular-nums">{wpm}</div>
          </div>
          <div className="rounded-xl bg-card border border-border/60 p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">Accuracy</div>
            <div className={`text-2xl font-black tabular-nums ${accuracy < 80 ? "text-red-400" : accuracy < 95 ? "text-yellow-400" : "text-green-400"}`}>{accuracy}%</div>
          </div>
          <div className="rounded-xl bg-card border border-border/60 p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">Time</div>
            <div className="text-2xl font-black text-muted-foreground tabular-nums">{formatTime(elapsedSec)}</div>
          </div>
        </div>

        {/* Progress bar (words, not time!) */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{wordsCompleted} / {goalWords} words</span>
          </div>
          <div className="h-3 bg-border/30 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${lesson.color}`}
              style={{ width: `${progressPct}%` }}
              transition={{ type: "spring", stiffness: 80 }}
            />
          </div>
          {/* Milestone ticks */}
          <div className="flex justify-between mt-1">
            {[0.25, 0.5, 0.75, 1].map(t => (
              <span key={t} className={`text-[10px] ${wordsCompleted >= goalWords * t ? "text-primary font-bold" : "text-muted-foreground/30"}`}>
                {Math.round(goalWords * t)}
              </span>
            ))}
          </div>
        </div>

        {/* Typing area */}
        <div
          className="relative rounded-2xl bg-card border border-border/60 p-6 mb-4 cursor-text min-h-[120px]"
          onClick={() => inputRef.current?.focus()}
        >
          {!isStarted && !isFinished && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-card/70 backdrop-blur-sm z-10">
              <div className="text-center">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${lesson.color} flex items-center justify-center text-xl mx-auto mb-2 shadow-lg`}>{lesson.icon}</div>
                <p className="font-black text-lg">Click here to start</p>
                <p className="text-xs text-muted-foreground mt-1">No time limit — practice at your own pace</p>
              </div>
            </div>
          )}
          <div className="font-mono text-lg leading-relaxed select-none flex flex-wrap gap-x-2 gap-y-1.5"
            style={{ maxHeight: "120px", overflow: "hidden" }}
          >
            {words.slice(Math.max(0, currentWordIndex - 3), currentWordIndex + 25).map((word, relIdx) => {
              const absIdx = relIdx + Math.max(0, currentWordIndex - 3);
              const chars = charStates[absIdx] || word.split("").map(c => ({ char: c, state: "waiting" as CharState }));
              const isCurrentWord = absIdx === currentWordIndex;
              return (
                <span key={absIdx} className={`relative rounded ${isCurrentWord ? "bg-primary/15 ring-1 ring-primary/40 px-0.5" : ""}`}>
                  {chars.filter(c => c.char !== " ").map((charInfo, charIdx) => (
                    <span key={charIdx}
                      className={`typing-char transition-colors ${
                        charInfo.state === "correct"   ? "correct" :
                        charInfo.state === "incorrect" ? "incorrect" :
                        isCurrentWord && charIdx === currentCharIndex ? "current" :
                        "text-muted-foreground/60"
                      }`}
                    >{charInfo.char}</span>
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
            autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
          />
        </div>

        {/* Keyboard with finger guide */}
        <div className="mb-4">
          <KeyboardVisualizer
            highlightKey={isStarted && !isFinished ? nextKey : undefined}
            showFingerGuide={true}
          />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="outline" onClick={initTest} className="border-border/60 hover:bg-white/5 gap-2">
            <RefreshCw className="w-4 h-4" />Restart
          </Button>
          {isStarted && !isFinished && (
            <Button onClick={() => finishTest(wordsCompleted, correctKeystrokes, totalKeystrokes, mistakes)}
              className="bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 gap-2"
            >
              <Zap className="w-4 h-4" />Finish Early
            </Button>
          )}
          {nextLesson && (
            <Link href={`/lessons/${lesson.nextId}`}>
              <Button variant="outline" className="border-border/60 hover:bg-white/5 gap-2 text-muted-foreground">
                Skip <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

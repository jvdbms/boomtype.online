import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, RefreshCw, Zap, ArrowLeft, ChevronRight, Trophy, Mic, MicOff, Volume2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { generateLessonWords } from "@/lib/words";
import { saveLastResult } from "@/lib/storage";
import KeyboardVisualizer from "@/components/KeyboardVisualizer";
import { useVoice } from "@/components/VoiceInstructor";

const LESSONS: Record<number, {
  title: string;
  desc: string;
  duration: 30 | 60;
  voiceIntro: string;
  icon: string;
  color: string;
  nextId?: number;
}> = {
  1: { title: "Home Row Mastery",      desc: "Focus on ASDF and JKL; keys",        duration: 30, voiceIntro: "Home row lesson. Rest fingers on A S D F and J K L semicolon. Start typing when ready.",     icon: "🏠", color: "from-green-500 to-emerald-600",  nextId: 2 },
  2: { title: "Top Row Speed",          desc: "Practice QWERTY and YUIOP",           duration: 30, voiceIntro: "Top row lesson. Reach up to QWERTY and YUIOP. Keep home row as your base.",                    icon: "⬆️", color: "from-blue-500 to-cyan-600",      nextId: 7 },
  3: { title: "Number Row Precision",   desc: "Conquer numbers without looking",     duration: 30, voiceIntro: "Number row! Reach the digits without looking down. Start when ready.",                         icon: "🔢", color: "from-yellow-500 to-amber-600",   nextId: 4 },
  4: { title: "Speed Drills",           desc: "High-frequency common words",         duration: 60, voiceIntro: "Speed drill! Type the most common English words as fast as possible. Go!",                    icon: "⚡", color: "from-orange-500 to-red-600",     nextId: 5 },
  5: { title: "Advanced Punctuation",   desc: "Commas, semicolons, quotes, and more",duration: 60, voiceIntro: "Punctuation lesson. Focus on commas, semicolons, and special characters.",                   icon: "✍️", color: "from-purple-500 to-violet-600",  nextId: 6 },
  6: { title: "Code Typing",            desc: "Brackets, symbols, code patterns",    duration: 60, voiceIntro: "Code typing lesson. Practice brackets, braces, and symbols.",                                 icon: "💻", color: "from-pink-500 to-rose-600",     nextId: undefined },
  7: { title: "Bottom Row Basics",      desc: "Master ZXCV and BNM keys",           duration: 30, voiceIntro: "Bottom row lesson. Practice Z X C V B N M with your lower fingers.",                         icon: "⬇️", color: "from-teal-500 to-cyan-600",     nextId: 3 },
};

const COMPLETED_KEY = "boomtype_completed_lessons";
function markCompleted(id: number) {
  try {
    const prev: number[] = JSON.parse(localStorage.getItem(COMPLETED_KEY) || "[]");
    if (!prev.includes(id)) localStorage.setItem(COMPLETED_KEY, JSON.stringify([...prev, id]));
  } catch {}
}

type CharState = "waiting" | "correct" | "incorrect" | "current";
interface CharInfo { char: string; state: CharState; }

export default function LessonTest() {
  const params = useParams<{ id: string }>();
  const lessonId = parseInt(params.id || "1", 10);
  const lesson = LESSONS[lessonId];
  const [, setLocation] = useLocation();
  const duration = lesson?.duration || 30;
  const { speak, enabled: voiceEnabled, gender, toggleEnabled: toggleVoice, toggleGender } = useVoice();

  const [words, setWords] = useState<string[]>([]);
  const [charStates, setCharStates] = useState<CharInfo[][]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [input, setInput] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showResults, setShowResults] = useState(false);
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
      { char: " ", state: "waiting" as CharState },
    ]));
    setCurrentWordIndex(0);
    setCurrentCharIndex(0);
    setInput("");
    setIsStarted(false);
    setIsFinished(false);
    setShowResults(false);
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
  useEffect(() => { if (lesson) speak(lesson.voiceIntro); }, [lessonId]);

  useEffect(() => {
    if (isStarted && !isFinished) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { finishTest(); return 0; }
          if (prev === Math.floor(duration / 2) && !halfSpokenRef.current) {
            halfSpokenRef.current = true;
            speak("Halfway there! Keep going!");
          }
          if (prev === 10) speak("Ten seconds left!");
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
    speak(`Lesson complete! ${finalWpm} words per minute, ${finalAccuracy} percent accuracy. Excellent work!`, true);
    saveLastResult({ wpm: finalWpm, accuracy: finalAccuracy, mistakes, duration });
    markCompleted(lessonId);
    setTimeout(() => setShowResults(true), 400);
  }, [currentWordIndex, totalKeystrokes, correctKeystrokes, mistakes, duration, speak, lessonId]);

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
          next[currentWordIndex] = [
            ...currentWord.split("").map((char, i) => ({ char, state: (input[i] === char ? "correct" : "incorrect") as CharState })),
            { char: " ", state: "correct" as CharState },
          ];
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
          setNextKey(words[next]?.[0] || "");
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
  }, [isFinished, isStarted, input, currentWordIndex, words, lessonId, speak]);

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

  const timerPercent = (timeLeft / duration) * 100;
  const nextLesson = lesson.nextId ? LESSONS[lesson.nextId] : null;

  return (
    <div className="min-h-screen py-6 px-4 relative">
      {/* Results overlay */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xl px-4"
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.3 }}
              className="rounded-3xl bg-card border border-border/60 p-8 max-w-md w-full text-center shadow-2xl"
            >
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${lesson.color} flex items-center justify-center text-4xl mx-auto mb-5 shadow-lg`}>
                {lesson.icon}
              </div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Lesson Complete!</div>
              <h2 className="text-2xl font-black mb-6">{lesson.title}</h2>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="rounded-xl bg-primary/10 border border-primary/20 p-3">
                  <div className="text-2xl font-black text-primary">{wpm}</div>
                  <div className="text-xs text-muted-foreground">WPM</div>
                </div>
                <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-3">
                  <div className="text-2xl font-black text-green-400">{accuracy}%</div>
                  <div className="text-xs text-muted-foreground">Accuracy</div>
                </div>
                <div className="rounded-xl bg-orange-500/10 border border-orange-500/20 p-3">
                  <div className="text-2xl font-black text-orange-400">{mistakes}</div>
                  <div className="text-xs text-muted-foreground">Mistakes</div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {nextLesson && (
                  <Link href={`/lessons/${lesson.nextId}`}>
                    <Button className={`w-full bg-gradient-to-r ${lesson.color} text-white font-black gap-2 py-5 h-auto text-base hover:opacity-90 shadow-lg`}>
                      <ChevronRight className="w-5 h-5" />
                      Next: {nextLesson.title}
                    </Button>
                  </Link>
                )}
                {!nextLesson && (
                  <Link href="/lessons">
                    <Button className="w-full bg-gradient-to-r from-primary to-accent text-white font-black gap-2 py-5 h-auto text-base hover:opacity-90">
                      <Trophy className="w-5 h-5" />
                      All Lessons Complete!
                    </Button>
                  </Link>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 border-border/60 hover:bg-white/5 gap-1.5" onClick={initTest}>
                    <RefreshCw className="w-4 h-4" />
                    Retry
                  </Button>
                  <Button variant="outline" className="flex-1 border-border/60 hover:bg-white/5 gap-1.5" onClick={() => setLocation("/results")}>
                    <Zap className="w-4 h-4" />
                    Full Results
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/lessons" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Lessons
          </Link>

          {/* Voice controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleVoice}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                voiceEnabled
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-card border-border/50 text-muted-foreground hover:text-foreground"
              }`}
              title={voiceEnabled ? "Disable voice coach" : "Enable voice coach"}
            >
              {voiceEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              Coach
            </button>
            {voiceEnabled && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={toggleGender}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-accent/10 border-accent/30 text-accent text-xs font-semibold hover:bg-accent/20 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" />
                {gender === "female" ? "♀ Female" : "♂ Male"}
              </motion.button>
            )}
          </div>
        </div>

        {/* Lesson header */}
        <div className="text-center mb-6">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r ${lesson.color} text-white text-sm font-black mb-3 shadow-lg`}>
            <span>{lesson.icon}</span>
            Lesson {lessonId}
          </div>
          <h1 className="text-3xl font-black mb-1">{lesson.title}</h1>
          <p className="text-muted-foreground">{lesson.desc}</p>
          {nextLesson && (
            <p className="text-xs text-muted-foreground mt-1">
              Next up: <span className="text-primary font-medium">{nextLesson.icon} {nextLesson.title}</span>
            </p>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-8 mb-5">
          <div className="text-center">
            <div className="text-xs text-muted-foreground flex items-center gap-1 justify-center mb-1">
              <Timer className="w-3.5 h-3.5" />Time
            </div>
            <div className={`text-5xl font-black tabular-nums transition-colors ${timeLeft <= 10 && isStarted ? "text-red-400" : "text-primary"}`}>
              {timeLeft}
            </div>
          </div>
          <div className="w-px h-16 bg-border/50" />
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">WPM</div>
            <div className="text-5xl font-black tabular-nums bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{wpm}</div>
          </div>
          <div className="w-px h-16 bg-border/50" />
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Accuracy</div>
            <div className={`text-5xl font-black tabular-nums ${accuracy < 80 ? "text-red-400" : accuracy < 95 ? "text-yellow-400" : "text-green-400"}`}>
              {accuracy}<span className="text-2xl text-muted-foreground">%</span>
            </div>
          </div>
        </div>

        {/* Timer bar */}
        <div className="h-2 bg-border/30 rounded-full mb-6 overflow-hidden">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${lesson.color} transition-all`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>

        {/* Typing area */}
        <div
          className="relative rounded-2xl bg-card border border-border/60 p-8 mb-5 cursor-text min-h-[140px]"
          onClick={() => inputRef.current?.focus()}
        >
          {!isStarted && !isFinished && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-card/60 backdrop-blur-sm z-10">
              <div className="text-center">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${lesson.color} flex items-center justify-center text-2xl mx-auto mb-3 shadow-lg`}>
                  {lesson.icon}
                </div>
                <p className="text-lg font-black">Click to Start</p>
                <p className="text-sm text-muted-foreground mt-1">Then type the highlighted words</p>
              </div>
            </div>
          )}

          <div
            className="font-mono text-xl leading-relaxed select-none flex flex-wrap gap-x-2 gap-y-2"
            style={{ maxHeight: "144px", overflow: "hidden" }}
          >
            {words.slice(Math.max(0, currentWordIndex - 5), currentWordIndex + 30).map((word, relIdx) => {
              const absIdx = relIdx + Math.max(0, currentWordIndex - 5);
              const chars = charStates[absIdx] || word.split("").map(c => ({ char: c, state: "waiting" as CharState }));
              const isCurrentWord = absIdx === currentWordIndex;
              return (
                <span
                  key={absIdx}
                  className={`relative rounded ${isCurrentWord ? "bg-primary/15 ring-1 ring-primary/30 px-0.5" : ""}`}
                >
                  {chars.filter(c => c.char !== " ").map((charInfo, charIdx) => (
                    <span
                      key={charIdx}
                      className={`typing-char transition-colors ${
                        charInfo.state === "correct"   ? "correct" :
                        charInfo.state === "incorrect" ? "incorrect" :
                        isCurrentWord && charIdx === currentCharIndex ? "current" :
                        "text-muted-foreground/60"
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
            autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
          />
        </div>

        {/* Keyboard with next-key highlight */}
        <div className="mb-5">
          <KeyboardVisualizer highlightKey={isStarted && !isFinished ? nextKey : undefined} />
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={initTest} className="border-border/60 hover:bg-white/5 gap-2">
            <RefreshCw className="w-4 h-4" />
            Restart
          </Button>
          {isStarted && !isFinished && (
            <Button onClick={finishTest} className="bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 gap-2">
              <Zap className="w-4 h-4" />
              Finish Early
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

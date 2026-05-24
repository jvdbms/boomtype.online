import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw, ArrowLeft, ChevronRight, Trophy,
  CheckCircle2, Target, Lock, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { addXP, saveLastResult } from "@/lib/storage";
import KeyboardVisualizer from "@/components/KeyboardVisualizer";
import {
  LESSON_BY_ID,
  ROUNDS_PER_PHASE,
  getPhaseProgress,
  setRoundCompleted,
  type PhaseId,
  type PhaseProgress,
} from "@/lib/lessonContent";

const PHASES: { id: PhaseId; label: string; available: boolean }[] = [
  { id: "letter",    label: "Letter",    available: true },
  { id: "word",      label: "Word",      available: false },
  { id: "paragraph", label: "Paragraph", available: false },
];

interface RoundStats {
  wpm: number;
  accuracy: number;
  errors: number;
  durationMs: number;
}

export default function LessonTest() {
  const params = useParams<{ id: string }>();
  const lessonId = parseInt(params.id || "1", 10);
  const lesson = LESSON_BY_ID[lessonId];

  const [phase, setPhase] = useState<PhaseId>("letter");
  const [progress, setProgress] = useState<PhaseProgress>({ letter: 0, word: 0, paragraph: 0 });
  const [roundIndex, setRoundIndex] = useState(0);

  // Letter phase live state
  const [charIndex, setCharIndex] = useState(0);
  const [errors, setErrors] = useState(0);
  const [keystrokes, setKeystrokes] = useState(0);
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [roundResult, setRoundResult] = useState<RoundStats | null>(null);

  const liveRef = useRef<HTMLDivElement>(null);

  // Load progress and start at the user's next-uncompleted round
  useEffect(() => {
    if (!lesson) return;
    const p = getPhaseProgress(lessonId);
    setProgress(p);
    setRoundIndex(Math.min(p.letter, ROUNDS_PER_PHASE - 1));
  }, [lessonId, lesson]);

  // Page title
  useEffect(() => {
    if (lesson) document.title = `${lesson.title} | BoomType`;
  }, [lesson]);

  // Live timer tick (drives WPM updates while typing)
  useEffect(() => {
    if (startedAt === null || roundResult) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [startedAt, roundResult]);

  // Keep focus on the practice area for keyboard input
  useEffect(() => {
    liveRef.current?.focus();
  }, [roundIndex, phase, roundResult]);

  const target = lesson?.letterRounds[roundIndex] ?? "";

  const resetRound = useCallback(() => {
    setCharIndex(0);
    setErrors(0);
    setKeystrokes(0);
    setStartedAt(null);
    setRoundResult(null);
    setFlash(null);
    setShake(false);
    setNow(Date.now());
    requestAnimationFrame(() => liveRef.current?.focus());
  }, []);

  // Reset state when round/phase changes
  useEffect(() => {
    resetRound();
  }, [roundIndex, phase, resetRound]);

  const finishRound = useCallback(
    (finalErrors: number, finalKeystrokes: number, finishedAt: number, startTs: number) => {
      const durationMs = Math.max(finishedAt - startTs, 1);
      const minutes = durationMs / 60000;
      // Standard WPM = (chars / 5) / minutes
      const wpm = Math.max(0, Math.round(target.length / 5 / minutes));
      const accuracy = finalKeystrokes > 0
        ? Math.max(0, Math.round(((finalKeystrokes - finalErrors) / finalKeystrokes) * 100))
        : 100;

      const stats: RoundStats = { wpm, accuracy, errors: finalErrors, durationMs };
      setRoundResult(stats);

      const updated = setRoundCompleted(lessonId, phase, roundIndex);
      setProgress(updated);
      addXP(lesson?.xpPerRound || 5);
      saveLastResult({
        wpm,
        accuracy,
        mistakes: finalErrors,
        duration: Math.round(durationMs / 1000),
      });
    },
    [lessonId, phase, roundIndex, lesson, target.length],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (roundResult) return;
      if (e.key === "Tab" || e.key === "Shift" || e.key === "CapsLock" || e.key === "Meta" || e.key === "Control" || e.key === "Alt") return;
      if (e.key.length !== 1) return;
      e.preventDefault();

      const expected = target[charIndex];
      if (!expected) return;

      const startTs = startedAt ?? Date.now();
      if (startedAt === null) setStartedAt(startTs);

      const nextKeystrokes = keystrokes + 1;
      setKeystrokes(nextKeystrokes);

      if (e.key === expected) {
        const nextIndex = charIndex + 1;
        setCharIndex(nextIndex);
        setFlash("correct");
        setTimeout(() => setFlash((f) => (f === "correct" ? null : f)), 120);

        if (nextIndex >= target.length) {
          finishRound(errors, nextKeystrokes, Date.now(), startTs);
        }
      } else {
        const nextErrors = errors + 1;
        setErrors(nextErrors);
        setFlash("wrong");
        setShake(true);
        setTimeout(() => setShake(false), 250);
        setTimeout(() => setFlash((f) => (f === "wrong" ? null : f)), 180);
      }
    },
    [roundResult, target, charIndex, startedAt, keystrokes, errors, finishRound],
  );

  const liveStats = useMemo(() => {
    const durationMs = startedAt ? Math.max(now - startedAt, 1) : 0;
    const minutes = durationMs / 60000;
    const wpm = minutes > 0 ? Math.max(0, Math.round((charIndex / 5) / minutes)) : 0;
    const accuracy = keystrokes > 0 ? Math.max(0, Math.round(((keystrokes - errors) / keystrokes) * 100)) : 100;
    return { wpm, accuracy };
  }, [startedAt, now, charIndex, keystrokes, errors]);

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

  const currentChar = target[charIndex] || "";
  const phaseDone = progress[phase];
  const overallPct = (phaseDone / ROUNDS_PER_PHASE) * 100;
  const isLastRound = roundIndex >= ROUNDS_PER_PHASE - 1;
  const phaseComplete = !!roundResult && isLastRound;

  return (
    <div className="min-h-screen py-6 px-4 relative">
      <div className="max-w-3xl mx-auto">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <Link href="/lessons" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Lessons
          </Link>
          <div className="text-xs text-muted-foreground">
            Lesson <span className="text-foreground font-bold">{lesson.id}</span> of 4
          </div>
        </div>

        {/* Lesson header */}
        <div className="flex items-start gap-4 mb-4 rounded-2xl bg-card border border-border/60 p-4">
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${lesson.color} flex items-center justify-center text-2xl shrink-0 shadow-lg`}>
            {lesson.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-black mb-0.5">Lesson {lesson.id} — {lesson.shortTitle}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mb-1.5">{lesson.description}</p>
            <div className="flex items-center gap-2 text-[11px] sm:text-xs text-muted-foreground">
              <Target className="w-3 h-3" />
              <span className="font-mono font-bold text-foreground">{lesson.rowKeys}</span>
            </div>
          </div>
        </div>

        {/* Phase tabs */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {PHASES.map((ph) => {
            const active = ph.id === phase;
            const done = progress[ph.id];
            return (
              <button
                key={ph.id}
                onClick={() => ph.available && setPhase(ph.id)}
                disabled={!ph.available}
                data-testid={`phase-tab-${ph.id}`}
                className={`px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                  active
                    ? `bg-gradient-to-r ${lesson.color} text-white border-transparent shadow-lg`
                    : ph.available
                    ? "bg-card border-border/60 text-foreground hover:border-primary/40"
                    : "bg-card border-border/30 text-muted-foreground/60 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  {!ph.available && <Lock className="w-3 h-3" />}
                  <span>{ph.label}</span>
                  <span className={`text-[10px] ${active ? "text-white/80" : "text-muted-foreground"}`}>
                    {done}/{ROUNDS_PER_PHASE}
                  </span>
                </div>
                {!ph.available && (
                  <div className="text-[9px] mt-0.5 text-muted-foreground/70">Coming soon</div>
                )}
              </button>
            );
          })}
        </div>

        {/* Round selector */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="text-xs sm:text-sm font-bold text-muted-foreground">
            Round <span className="text-foreground">{roundIndex + 1}</span> of {ROUNDS_PER_PHASE}
          </div>
          <div className="flex gap-1 flex-wrap">
            {lesson.letterRounds.map((_, i) => {
              const completed = i < phaseDone;
              const isCurrent = i === roundIndex;
              const unlocked = i <= phaseDone;
              return (
                <button
                  key={i}
                  onClick={() => unlocked && setRoundIndex(i)}
                  disabled={!unlocked}
                  data-testid={`round-pill-${i}`}
                  className={`w-7 h-7 rounded-md text-[10px] font-black border transition-all ${
                    isCurrent
                      ? `bg-gradient-to-br ${lesson.color} text-white border-transparent shadow`
                      : completed
                      ? "bg-green-500/15 text-green-400 border-green-500/30"
                      : unlocked
                      ? "bg-card text-muted-foreground border-border/50 hover:border-primary/40"
                      : "bg-card/40 text-muted-foreground/40 border-border/20 cursor-not-allowed"
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Round progress bar */}
        <div className="mb-4 h-2 bg-border/25 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${lesson.color}`}
            initial={false}
            animate={{ width: `${overallPct}%` }}
            transition={{ type: "spring", stiffness: 80 }}
          />
        </div>

        {/* Live stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: "Letters", value: `${charIndex}/${target.length}`, color: "text-primary" },
            { label: "WPM",     value: liveStats.wpm,                  color: "text-accent" },
            { label: "Accuracy",value: `${liveStats.accuracy}%`,        color: liveStats.accuracy >= 90 ? "text-green-400" : liveStats.accuracy >= 70 ? "text-yellow-400" : "text-red-400" },
            { label: "Errors",  value: errors,                          color: errors === 0 ? "text-muted-foreground" : "text-red-400" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-card border border-border/60 p-2.5 sm:p-3 text-center">
              <div className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">{s.label}</div>
              <div className={`text-base sm:text-xl font-black tabular-nums ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Main practice card — Letter phase */}
        <motion.div
          ref={liveRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          animate={shake ? { x: [-6, 6, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.25 }}
          className={`relative rounded-2xl border p-6 sm:p-8 mb-5 outline-none cursor-text transition-colors ${
            flash === "correct" ? "bg-green-500/8 border-green-500/40" :
            flash === "wrong"   ? "bg-red-500/8 border-red-500/40" :
            "bg-card border-border/60 focus:border-primary/40"
          }`}
          onClick={() => liveRef.current?.focus()}
        >
          {/* Sequence preview */}
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap mb-6 min-h-[60px]">
            {target.split("").map((ch, i) => {
              const typed = i < charIndex;
              const isCurrent = i === charIndex;
              return (
                <span
                  key={i}
                  className={`font-mono font-black text-2xl sm:text-3xl w-8 sm:w-10 text-center transition-all duration-100 ${
                    typed
                      ? "text-green-400"
                      : isCurrent
                      ? "text-foreground"
                      : "text-muted-foreground/35"
                  } ${isCurrent ? "border-b-2 border-primary" : ""}`}
                >
                  {ch}
                </span>
              );
            })}
          </div>

          {/* Big current key */}
          <div className="flex flex-col items-center justify-center min-h-[180px] gap-3">
            {roundResult ? (
              <RoundComplete
                stats={roundResult}
                color={lesson.color}
                isLastRound={isLastRound}
                onRetry={resetRound}
                onNext={() => {
                  if (isLastRound) return;
                  setRoundIndex((r) => Math.min(r + 1, ROUNDS_PER_PHASE - 1));
                }}
              />
            ) : (
              <>
                <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
                  Press this key
                </div>
                <motion.div
                  key={charIndex}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`font-mono font-black text-7xl sm:text-8xl select-none ${
                    flash === "wrong" ? "text-red-400" : flash === "correct" ? "text-green-400" : "text-foreground"
                  }`}
                  data-testid="current-letter"
                >
                  {currentChar === " " ? "␣" : currentChar}
                </motion.div>
                <div className="text-xs text-muted-foreground mt-1">
                  {startedAt === null
                    ? "Type the letter above to begin"
                    : "Keep going — only the correct key advances"}
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Keyboard visualizer with focus key */}
        <div className="mb-4">
          <KeyboardVisualizer highlightKey={currentChar?.toLowerCase()} />
          <p className="text-center text-[11px] text-muted-foreground mt-2">
            Practicing: <span className="font-mono font-bold text-foreground">{lesson.rowKeys}</span>
          </p>
        </div>

        {/* Phase-complete banner */}
        <AnimatePresence>
          {phaseComplete && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl bg-gradient-to-br from-green-500/15 to-emerald-500/10 border border-green-500/30 p-5 text-center mb-4"
            >
              <Trophy className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-lg font-black mb-1">Letter Phase Complete!</div>
              <p className="text-sm text-muted-foreground mb-4">
                All 10 letter rounds done. Word and Paragraph phases are coming soon.
              </p>
              <div className="flex gap-2 justify-center flex-wrap">
                <Button variant="outline" onClick={() => setRoundIndex(0)} className="gap-1.5">
                  <RefreshCw className="w-4 h-4" /> Replay Phase
                </Button>
                <Link href="/lessons">
                  <Button className={`bg-gradient-to-r ${lesson.color} text-white gap-1.5`}>
                    <ChevronRight className="w-4 h-4" /> Back to Lessons
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function RoundComplete({
  stats, color, isLastRound, onRetry, onNext,
}: {
  stats: RoundStats;
  color: string;
  isLastRound: boolean;
  onRetry: () => void;
  onNext: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full text-center"
    >
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-bold mb-3">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Round Complete
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4 max-w-sm mx-auto">
        <Stat label="WPM"      value={stats.wpm}              color="text-primary" />
        <Stat label="Accuracy" value={`${stats.accuracy}%`}    color={stats.accuracy >= 95 ? "text-green-400" : stats.accuracy >= 80 ? "text-yellow-400" : "text-red-400"} />
        <Stat label="Errors"   value={stats.errors}            color={stats.errors === 0 ? "text-green-400" : "text-red-400"} />
      </div>
      <div className="flex gap-2 justify-center flex-wrap">
        <Button
          variant="outline"
          onClick={onRetry}
          data-testid="retry-round"
          className="gap-1.5 border-border/60 hover:bg-white/5"
        >
          <RefreshCw className="w-4 h-4" /> Retry Round
        </Button>
        {!isLastRound && (
          <Button
            onClick={onNext}
            data-testid="next-round"
            className={`gap-1.5 bg-gradient-to-r ${color} text-white shadow-lg hover:opacity-90`}
          >
            <Sparkles className="w-4 h-4" /> Next Round
          </Button>
        )}
      </div>
    </motion.div>
  );
}

function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-xl bg-white/5 border border-border/40 p-2.5">
      <div className={`text-xl font-black tabular-nums ${color}`}>{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

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
  ENABLED_PHASES,
  getPhaseProgress,
  setRoundCompleted,
  isPhaseUnlocked,
  phaseUnlockHint,
  latestUnlockedPhase,
  type PhaseId,
  type PhaseProgress,
} from "@/lib/lessonContent";

const PHASES: { id: PhaseId; label: string }[] = [
  { id: "letter",    label: "Letter" },
  { id: "word",      label: "Word" },
  { id: "paragraph", label: "Paragraph" },
];

const PHASE_LABEL: Record<PhaseId, string> = {
  letter: "Letter",
  word: "Word",
  paragraph: "Paragraph",
};

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

  // Shared live state
  const [keystrokes, setKeystrokes] = useState(0);
  const [errors, setErrors] = useState(0);
  const [correctChars, setCorrectChars] = useState(0); // for WPM
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [roundResult, setRoundResult] = useState<RoundStats | null>(null);

  // Letter-phase state
  const [charIndex, setCharIndex] = useState(0);

  // Word-phase state
  const [wordIdx, setWordIdx] = useState(0);
  const [wordInput, setWordInput] = useState("");

  // Paragraph-phase state
  const [paraIdx, setParaIdx] = useState(0);
  const [paraStatuses, setParaStatuses] = useState<("correct" | "wrong" | undefined)[]>([]);

  const liveRef = useRef<HTMLDivElement>(null);

  // Load progress whenever lesson or phase changes.
  // If the current phase is locked (e.g. fresh visit or progress reset),
  // bump down to the latest unlocked phase so the user can never be stuck
  // staring at a locked tab.
  useEffect(() => {
    if (!lesson) return;
    const p = getPhaseProgress(lessonId);
    setProgress(p);
    if (!isPhaseUnlocked(phase, p)) {
      const target = latestUnlockedPhase(p);
      if (target !== phase) {
        setPhase(target);
        setRoundIndex(Math.min(p[target], ROUNDS_PER_PHASE - 1));
        return;
      }
    }
    setRoundIndex(Math.min(p[phase], ROUNDS_PER_PHASE - 1));
  }, [lessonId, lesson, phase]);

  useEffect(() => {
    if (lesson) document.title = `${lesson.title} | BoomType`;
  }, [lesson]);

  useEffect(() => {
    if (startedAt === null || roundResult) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [startedAt, roundResult]);

  useEffect(() => {
    liveRef.current?.focus();
  }, [roundIndex, phase, roundResult]);

  // Targets
  const letterTarget = lesson?.letterRounds[roundIndex] ?? "";
  const wordTarget = useMemo<string[]>(
    () => lesson?.wordRounds[roundIndex] ?? [],
    [lesson, roundIndex],
  );
  const paraTarget = lesson?.paragraphRounds[roundIndex] ?? "";

  // Total chars expected this round (used for WPM denominator on word phase)
  const totalTargetChars = useMemo(() => {
    if (phase === "letter") return letterTarget.length;
    if (phase === "paragraph") return paraTarget.length;
    // word: include spaces between words
    return wordTarget.reduce((sum, w) => sum + w.length, 0) + Math.max(0, wordTarget.length - 1);
  }, [phase, letterTarget, wordTarget, paraTarget]);

  const resetRound = useCallback(() => {
    setCharIndex(0);
    setWordIdx(0);
    setWordInput("");
    setParaIdx(0);
    setParaStatuses([]);
    setErrors(0);
    setKeystrokes(0);
    setCorrectChars(0);
    setStartedAt(null);
    setRoundResult(null);
    setFlash(null);
    setShake(false);
    setNow(Date.now());
    requestAnimationFrame(() => liveRef.current?.focus());
  }, []);

  useEffect(() => {
    resetRound();
  }, [roundIndex, phase, resetRound]);

  const finishRound = useCallback(
    (
      finalCorrectChars: number,
      finalErrors: number,
      finalKeystrokes: number,
      finishedAt: number,
      startTs: number,
    ) => {
      const durationMs = Math.max(finishedAt - startTs, 1);
      const minutes = durationMs / 60000;
      const wpm = Math.max(0, Math.round(finalCorrectChars / 5 / minutes));
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
    [lessonId, phase, roundIndex, lesson],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (roundResult) return;
      const k = e.key;
      if (k === "Tab" || k === "Shift" || k === "CapsLock" || k === "Meta" || k === "Control" || k === "Alt") return;

      // ── LETTER PHASE ────────────────────────────────────────
      if (phase === "letter") {
        if (k.length !== 1) return;
        e.preventDefault();

        const expected = letterTarget[charIndex];
        if (!expected) return;

        const startTs = startedAt ?? Date.now();
        if (startedAt === null) setStartedAt(startTs);

        const nextKeystrokes = keystrokes + 1;
        setKeystrokes(nextKeystrokes);

        if (k === expected) {
          const nextIndex = charIndex + 1;
          const nextCorrect = correctChars + 1;
          setCharIndex(nextIndex);
          setCorrectChars(nextCorrect);
          setFlash("correct");
          setTimeout(() => setFlash((f) => (f === "correct" ? null : f)), 120);

          if (nextIndex >= letterTarget.length) {
            finishRound(nextCorrect, errors, nextKeystrokes, Date.now(), startTs);
          }
        } else {
          const nextErrors = errors + 1;
          setErrors(nextErrors);
          setFlash("wrong");
          setShake(true);
          setTimeout(() => setShake(false), 250);
          setTimeout(() => setFlash((f) => (f === "wrong" ? null : f)), 180);
        }
        return;
      }

      // ── WORD PHASE ─────────────────────────────────────────
      if (phase === "word") {
        const current = wordTarget[wordIdx];
        if (current === undefined) return;

        // Backspace: delete last typed char and fully undo its metric impact.
        // (Otherwise users could type correct → backspace → retype and inflate WPM.)
        if (k === "Backspace") {
          e.preventDefault();
          if (wordInput.length === 0) return;
          const lastPos = wordInput.length - 1;
          const lastTyped = wordInput[lastPos];
          const expectedAtLast = current[lastPos]; // undefined for overflow chars
          if (expectedAtLast !== undefined && lastTyped === expectedAtLast) {
            setCorrectChars((c) => Math.max(0, c - 1));
          } else {
            setErrors((er) => Math.max(0, er - 1));
          }
          setKeystrokes((k2) => Math.max(0, k2 - 1));
          setWordInput((s) => s.slice(0, -1));
          return;
        }

        // Submit word with space or Enter
        if (k === " " || k === "Enter") {
          e.preventDefault();
          if (wordInput.length === 0) return;

          const startTs = startedAt ?? Date.now();
          if (startedAt === null) setStartedAt(startTs);

          const nextKeystrokes = keystrokes + 1; // count the space/enter
          setKeystrokes(nextKeystrokes);

          const isCorrect = wordInput === current;
          const isLastWord = wordIdx + 1 >= wordTarget.length;
          let nextCorrect = correctChars;
          let nextErrors = errors;

          if (isCorrect && !isLastWord) {
            // count the separating space as a correct char
            nextCorrect = correctChars + 1;
            setCorrectChars(nextCorrect);
            setFlash("correct");
            setTimeout(() => setFlash((f) => (f === "correct" ? null : f)), 120);
          } else if (!isCorrect) {
            nextErrors = errors + 1;
            setErrors(nextErrors);
            setFlash("wrong");
            setShake(true);
            setTimeout(() => setShake(false), 250);
            setTimeout(() => setFlash((f) => (f === "wrong" ? null : f)), 180);
          }

          setWordIdx(wordIdx + 1);
          setWordInput("");

          if (isLastWord) {
            finishRound(nextCorrect, nextErrors, nextKeystrokes, Date.now(), startTs);
          }
          return;
        }

        // Regular character
        if (k.length !== 1) return;
        e.preventDefault();

        const startTs = startedAt ?? Date.now();
        if (startedAt === null) setStartedAt(startTs);

        const nextKeystrokes = keystrokes + 1;
        setKeystrokes(nextKeystrokes);

        const pos = wordInput.length;
        const expected = current[pos];

        if (expected !== undefined && k === expected) {
          setCorrectChars((c) => c + 1);
          setWordInput((s) => s + k);
        } else {
          setErrors((er) => er + 1);
          // Still append so the user sees the red overflow / mistake
          setWordInput((s) => s + k);
          setFlash("wrong");
          setShake(true);
          setTimeout(() => setShake(false), 200);
          setTimeout(() => setFlash((f) => (f === "wrong" ? null : f)), 160);
        }
        return;
      }

      // ── PARAGRAPH PHASE ────────────────────────────────────
      if (phase === "paragraph") {
        if (paraTarget.length === 0) return;

        // Backspace: undo last typed position and its metric impact.
        if (k === "Backspace") {
          e.preventDefault();
          if (paraIdx === 0) return;
          const prev = paraIdx - 1;
          const prevStatus = paraStatuses[prev];
          if (prevStatus === "correct") {
            setCorrectChars((c) => Math.max(0, c - 1));
          } else if (prevStatus === "wrong") {
            setErrors((er) => Math.max(0, er - 1));
          }
          setKeystrokes((k2) => Math.max(0, k2 - 1));
          setParaIdx(prev);
          setParaStatuses((arr) => {
            const next = arr.slice();
            next[prev] = undefined;
            return next;
          });
          return;
        }

        // Accept printable chars including space; ignore Enter and other non-chars.
        if (k.length !== 1) return;
        if (paraIdx >= paraTarget.length) return;
        e.preventDefault();

        const startTs = startedAt ?? Date.now();
        if (startedAt === null) setStartedAt(startTs);

        const nextKeystrokes = keystrokes + 1;
        setKeystrokes(nextKeystrokes);

        const expected = paraTarget[paraIdx];
        const isCorrect = k === expected;
        const nextIdx = paraIdx + 1;
        let nextCorrect = correctChars;
        let nextErrors = errors;

        if (isCorrect) {
          nextCorrect = correctChars + 1;
          setCorrectChars(nextCorrect);
          setFlash("correct");
          setTimeout(() => setFlash((f) => (f === "correct" ? null : f)), 80);
        } else {
          nextErrors = errors + 1;
          setErrors(nextErrors);
          setFlash("wrong");
          setShake(true);
          setTimeout(() => setShake(false), 200);
          setTimeout(() => setFlash((f) => (f === "wrong" ? null : f)), 160);
        }

        setParaIdx(nextIdx);
        setParaStatuses((arr) => {
          const next = arr.slice();
          next[paraIdx] = isCorrect ? "correct" : "wrong";
          return next;
        });

        if (nextIdx >= paraTarget.length) {
          finishRound(nextCorrect, nextErrors, nextKeystrokes, Date.now(), startTs);
        }
        return;
      }
    },
    [
      roundResult, phase, letterTarget, charIndex, startedAt, keystrokes, errors,
      correctChars, wordTarget, wordIdx, wordInput, paraTarget, paraIdx, paraStatuses,
      finishRound,
    ],
  );

  const liveStats = useMemo(() => {
    const durationMs = startedAt ? Math.max(now - startedAt, 1) : 0;
    const minutes = durationMs / 60000;
    const wpm = minutes > 0 ? Math.max(0, Math.round((correctChars / 5) / minutes)) : 0;
    const accuracy = keystrokes > 0
      ? Math.max(0, Math.round(((keystrokes - errors) / keystrokes) * 100))
      : 100;
    return { wpm, accuracy };
  }, [startedAt, now, correctChars, keystrokes, errors]);

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

  const currentLetter = letterTarget[charIndex] || "";
  const currentWord = wordTarget[wordIdx] || "";
  // Key to highlight on the visualizer
  const highlightKey =
    phase === "letter"
      ? currentLetter?.toLowerCase()
      : phase === "word"
      ? (currentWord[wordInput.length] ?? currentWord[currentWord.length - 1] ?? "")?.toLowerCase()
      : (paraTarget[paraIdx] ?? "")?.toLowerCase();

  const phaseDone = progress[phase];
  const overallPct = (phaseDone / ROUNDS_PER_PHASE) * 100;
  const isLastRound = roundIndex >= ROUNDS_PER_PHASE - 1;
  const phaseComplete = !!roundResult && isLastRound;

  const progressLabel =
    phase === "letter"
      ? `${charIndex}/${letterTarget.length}`
      : phase === "word"
      ? `${wordIdx}/${wordTarget.length}`
      : `${paraIdx}/${paraTarget.length}`;
  const progressLabelTitle =
    phase === "letter" ? "Letters" : phase === "word" ? "Words" : "Chars";

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
            const enabled = ENABLED_PHASES.includes(ph.id);
            const unlocked = isPhaseUnlocked(ph.id, progress);
            const clickable = enabled && unlocked;
            const done = progress[ph.id];
            const hint = phaseUnlockHint(ph.id, progress);
            return (
              <button
                key={ph.id}
                onClick={() => clickable && setPhase(ph.id)}
                disabled={!clickable}
                data-testid={`phase-tab-${ph.id}`}
                title={hint ?? undefined}
                className={`px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                  active
                    ? `bg-gradient-to-r ${lesson.color} text-white border-transparent shadow-lg`
                    : clickable
                    ? "bg-card border-border/60 text-foreground hover:border-primary/40"
                    : "bg-card border-border/30 text-muted-foreground/60 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  {!clickable && <Lock className="w-3 h-3" />}
                  <span>{ph.label}</span>
                  <span className={`text-[10px] ${active ? "text-white/80" : "text-muted-foreground"}`}>
                    {done}/{ROUNDS_PER_PHASE}
                  </span>
                </div>
                {!enabled ? (
                  <div className="text-[9px] mt-0.5 text-muted-foreground/70">Coming soon</div>
                ) : hint ? (
                  <div className="text-[9px] mt-0.5 text-muted-foreground/70">{hint}</div>
                ) : null}
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
            {Array.from({ length: ROUNDS_PER_PHASE }).map((_, i) => {
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
            { label: progressLabelTitle, value: progressLabel, color: "text-primary" },
            { label: "WPM",      value: liveStats.wpm,                          color: "text-accent" },
            { label: "Accuracy", value: `${liveStats.accuracy}%`,                color: liveStats.accuracy >= 90 ? "text-green-400" : liveStats.accuracy >= 70 ? "text-yellow-400" : "text-red-400" },
            { label: "Errors",   value: errors,                                  color: errors === 0 ? "text-muted-foreground" : "text-red-400" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-card border border-border/60 p-2.5 sm:p-3 text-center">
              <div className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">{s.label}</div>
              <div className={`text-base sm:text-xl font-black tabular-nums ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Main practice card */}
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
          {phase === "letter" ? (
            <LetterPhaseContent
              target={letterTarget}
              charIndex={charIndex}
              currentChar={currentLetter}
              flash={flash}
              startedAt={startedAt}
              roundResult={roundResult}
              color={lesson.color}
              isLastRound={isLastRound}
              onRetry={resetRound}
              onNext={() => {
                if (isLastRound) return;
                setRoundIndex((r) => Math.min(r + 1, ROUNDS_PER_PHASE - 1));
              }}
              totalTargetChars={totalTargetChars}
            />
          ) : phase === "word" ? (
            <WordPhaseContent
              words={wordTarget}
              wordIdx={wordIdx}
              wordInput={wordInput}
              currentWord={currentWord}
              flash={flash}
              startedAt={startedAt}
              roundResult={roundResult}
              color={lesson.color}
              isLastRound={isLastRound}
              onRetry={resetRound}
              onNext={() => {
                if (isLastRound) return;
                setRoundIndex((r) => Math.min(r + 1, ROUNDS_PER_PHASE - 1));
              }}
            />
          ) : (
            <ParagraphPhaseContent
              target={paraTarget}
              typedIdx={paraIdx}
              statuses={paraStatuses}
              startedAt={startedAt}
              roundResult={roundResult}
              color={lesson.color}
              isLastRound={isLastRound}
              onRetry={resetRound}
              onNext={() => {
                if (isLastRound) return;
                setRoundIndex((r) => Math.min(r + 1, ROUNDS_PER_PHASE - 1));
              }}
            />
          )}
        </motion.div>

        {/* Keyboard visualizer with focus key */}
        <div className="mb-4">
          <KeyboardVisualizer highlightKey={highlightKey} />
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
              <div className="text-lg font-black mb-1">{PHASE_LABEL[phase]} Phase Complete!</div>
              <p className="text-sm text-muted-foreground mb-4">
                {phase === "letter"
                  ? "All 10 letter rounds done. Try the Word phase next!"
                  : phase === "word"
                  ? "All 10 word rounds done. Time for Paragraph practice!"
                  : "All 10 paragraph rounds done. You've finished this lesson!"}
              </p>
              <div className="flex gap-2 justify-center flex-wrap">
                <Button variant="outline" onClick={() => setRoundIndex(0)} className="gap-1.5">
                  <RefreshCw className="w-4 h-4" /> Replay Phase
                </Button>
                {phase === "letter" && ENABLED_PHASES.includes("word") ? (
                  <Button
                    onClick={() => setPhase("word")}
                    className={`bg-gradient-to-r ${lesson.color} text-white gap-1.5`}
                    data-testid="goto-word-phase"
                  >
                    <ChevronRight className="w-4 h-4" /> Start Word Phase
                  </Button>
                ) : phase === "word" && ENABLED_PHASES.includes("paragraph") ? (
                  <Button
                    onClick={() => setPhase("paragraph")}
                    className={`bg-gradient-to-r ${lesson.color} text-white gap-1.5`}
                    data-testid="goto-paragraph-phase"
                  >
                    <ChevronRight className="w-4 h-4" /> Start Paragraph Phase
                  </Button>
                ) : (
                  <Link href="/lessons">
                    <Button className={`bg-gradient-to-r ${lesson.color} text-white gap-1.5`}>
                      <ChevronRight className="w-4 h-4" /> Back to Lessons
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Letter phase practice card content ─────────────────────────
function LetterPhaseContent({
  target, charIndex, currentChar, flash, startedAt, roundResult,
  color, isLastRound, onRetry, onNext,
}: {
  target: string;
  charIndex: number;
  currentChar: string;
  flash: "correct" | "wrong" | null;
  startedAt: number | null;
  roundResult: RoundStats | null;
  color: string;
  isLastRound: boolean;
  onRetry: () => void;
  onNext: () => void;
  totalTargetChars: number;
}) {
  return (
    <>
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

      <div className="flex flex-col items-center justify-center min-h-[180px] gap-3">
        {roundResult ? (
          <RoundComplete
            stats={roundResult}
            color={color}
            isLastRound={isLastRound}
            onRetry={onRetry}
            onNext={onNext}
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
    </>
  );
}

// ── Word phase practice card content ───────────────────────────
function WordPhaseContent({
  words, wordIdx, wordInput, currentWord, flash, startedAt, roundResult,
  color, isLastRound, onRetry, onNext,
}: {
  words: string[];
  wordIdx: number;
  wordInput: string;
  currentWord: string;
  flash: "correct" | "wrong" | null;
  startedAt: number | null;
  roundResult: RoundStats | null;
  color: string;
  isLastRound: boolean;
  onRetry: () => void;
  onNext: () => void;
}) {
  return (
    <>
      {/* Words row preview */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-5 min-h-[40px]">
        {words.map((w, i) => {
          const done = i < wordIdx;
          const isCurrent = i === wordIdx;
          if (isCurrent) {
            return (
              <span
                key={i}
                className="font-mono font-black text-base sm:text-lg border-b-2 border-primary px-1"
                data-testid="current-word-preview"
              >
                {w.split("").map((ch, ci) => {
                  const typedCh = wordInput[ci];
                  let cls = "text-muted-foreground/60";
                  if (typedCh !== undefined) {
                    cls = typedCh === ch ? "text-green-400" : "text-red-400 underline";
                  }
                  return <span key={ci} className={cls}>{ch}</span>;
                })}
                {/* overflow chars (user typed extra) */}
                {wordInput.length > w.length && (
                  <span className="text-red-400 underline">
                    {wordInput.slice(w.length)}
                  </span>
                )}
              </span>
            );
          }
          return (
            <span
              key={i}
              className={`font-mono font-bold text-base sm:text-lg ${
                done ? "text-green-400/70 line-through" : "text-muted-foreground/40"
              }`}
            >
              {w}
            </span>
          );
        })}
      </div>

      <div className="flex flex-col items-center justify-center min-h-[180px] gap-3">
        {roundResult ? (
          <RoundComplete
            stats={roundResult}
            color={color}
            isLastRound={isLastRound}
            onRetry={onRetry}
            onNext={onNext}
          />
        ) : (
          <>
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
              Type this word
            </div>
            <motion.div
              key={wordIdx}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="font-mono font-black text-5xl sm:text-6xl select-none flex"
              data-testid="current-word"
            >
              {currentWord.split("").map((ch, ci) => {
                const typedCh = wordInput[ci];
                let cls = "text-foreground/80";
                if (typedCh !== undefined) {
                  cls = typedCh === ch ? "text-green-400" : "text-red-400";
                } else if (ci === wordInput.length) {
                  cls = `text-foreground ${flash === "wrong" ? "text-red-400" : ""}`;
                }
                return (
                  <span
                    key={ci}
                    className={`${cls} ${ci === wordInput.length ? "border-b-4 border-primary" : ""}`}
                  >
                    {ch}
                  </span>
                );
              })}
              {wordInput.length > currentWord.length && (
                <span className="text-red-400 underline">
                  {wordInput.slice(currentWord.length)}
                </span>
              )}
            </motion.div>
            <div className="text-xs text-muted-foreground mt-1">
              {startedAt === null
                ? "Start typing the word above. Press space to submit."
                : "Press space (or Enter) to submit — Backspace fixes mistakes"}
            </div>
          </>
        )}
      </div>
    </>
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

// ── Paragraph phase practice card content ──────────────────────
function ParagraphPhaseContent({
  target, typedIdx, statuses, startedAt, roundResult,
  color, isLastRound, onRetry, onNext,
}: {
  target: string;
  typedIdx: number;
  statuses: ("correct" | "wrong" | undefined)[];
  startedAt: number | null;
  roundResult: RoundStats | null;
  color: string;
  isLastRound: boolean;
  onRetry: () => void;
  onNext: () => void;
}) {
  // Group chars into word chunks so wrapping breaks between words, not inside.
  const chunks: { start: number; text: string }[] = [];
  {
    let buf = "";
    let bufStart = 0;
    for (let i = 0; i < target.length; i++) {
      buf += target[i];
      if (target[i] === " ") {
        chunks.push({ start: bufStart, text: buf });
        buf = "";
        bufStart = i + 1;
      }
    }
    if (buf) chunks.push({ start: bufStart, text: buf });
  }

  return (
    <>
      <div className="font-mono text-lg sm:text-xl leading-relaxed text-center select-none">
        {chunks.map((chunk, ci) => (
          <span key={ci} className="inline-block whitespace-pre">
            {chunk.text.split("").map((ch, k) => {
              const i = chunk.start + k;
              const status = statuses[i];
              const isCurrent = i === typedIdx;
              let cls = "text-muted-foreground/45";
              if (status === "correct") cls = "text-green-400";
              else if (status === "wrong")
                cls = "text-red-400 bg-red-500/10 rounded-sm";
              return (
                <span
                  key={k}
                  className={`${cls} ${isCurrent ? "border-b-2 border-primary text-foreground" : ""}`}
                  data-testid={isCurrent ? "current-para-char" : undefined}
                >
                  {ch === " " && status === "wrong" ? "·" : ch}
                </span>
              );
            })}
          </span>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center mt-6 min-h-[80px] gap-2">
        {roundResult ? (
          <RoundComplete
            stats={roundResult}
            color={color}
            isLastRound={isLastRound}
            onRetry={onRetry}
            onNext={onNext}
          />
        ) : (
          <div className="text-xs text-muted-foreground text-center">
            {startedAt === null
              ? "Start typing the paragraph above to begin"
              : "Keep going — Backspace fixes mistakes"}
          </div>
        )}
      </div>
    </>
  );
}

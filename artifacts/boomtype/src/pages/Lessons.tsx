import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Lock, CheckCircle2, ChevronRight, Trophy, Flame, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import KeyboardVisualizer from "@/components/KeyboardVisualizer";
import { getTotalXP } from "@/lib/storage";
import {
  ROW_LESSONS,
  ROUNDS_PER_LESSON,
  UNLOCK_THRESHOLD,
  getLessonProgress,
  isLessonUnlocked,
  isLessonComplete,
  lessonRoundsCompleted,
  enabledRoundsCompleted,
  type LessonProgressMap,
} from "@/lib/lessonContent";

export default function Lessons() {
  const [progress, setProgress] = useState<LessonProgressMap>({});
  const [hoverLesson, setHoverLesson] = useState<number | null>(null);
  const xp = getTotalXP();

  useEffect(() => {
    document.title = "Typing Lessons | BoomType — Structured Touch Typing Course";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Learn touch typing the right way — 4 keyboard rows × 3 phases × 10 rounds. Letter, word, and paragraph practice.",
      );
    }
    setProgress(getLessonProgress());
  }, []);

  const totalRounds = ROW_LESSONS.length * ROUNDS_PER_LESSON;
  const completedRounds = ROW_LESSONS.reduce(
    (sum, l) => sum + lessonRoundsCompleted(progress[l.id] || { letter: 0, word: 0, paragraph: 0 }),
    0,
  );
  const completedLessons = ROW_LESSONS.filter((l) => isLessonComplete(progress[l.id] || { letter: 0, word: 0, paragraph: 0 })).length;

  const hovered = ROW_LESSONS.find((l) => l.id === hoverLesson);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-4">
            <Trophy className="w-4 h-4" />
            Structured Touch Typing Course
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-3 bg-gradient-to-r from-white via-blue-100 to-accent bg-clip-text text-transparent">
            Master Every Row, One Step at a Time
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            4 lessons · 3 phases each · 10 rounds per phase. Letter → Word → Paragraph.
          </p>
        </motion.div>

        {/* Progress dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 sm:gap-4 mb-8"
        >
          <div className="rounded-2xl bg-card border border-border/60 p-4 sm:p-5 text-center">
            <div className="text-2xl sm:text-3xl font-black text-primary mb-1">{completedLessons}/{ROW_LESSONS.length}</div>
            <div className="text-[11px] sm:text-xs text-muted-foreground">Lessons Complete</div>
            <div className="mt-2 h-1.5 bg-border/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700"
                style={{ width: `${(completedRounds / totalRounds) * 100}%` }}
              />
            </div>
          </div>
          <div className="rounded-2xl bg-card border border-border/60 p-4 sm:p-5 text-center">
            <div className="text-2xl sm:text-3xl font-black text-accent mb-1">{completedRounds}/{totalRounds}</div>
            <div className="text-[11px] sm:text-xs text-muted-foreground">Rounds Done</div>
            <div className="flex justify-center mt-2">
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
          </div>
          <div className="rounded-2xl bg-card border border-border/60 p-4 sm:p-5 text-center">
            <div className="text-2xl sm:text-3xl font-black text-yellow-400 mb-1">{xp.toLocaleString()}</div>
            <div className="text-[11px] sm:text-xs text-muted-foreground">Total XP</div>
            <div className="flex justify-center mt-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </div>
          </div>
        </motion.div>

        {/* Keyboard preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <KeyboardVisualizer highlightKey={hovered?.focusKeyList[0]} />
          {hovered && (
            <p className="text-center text-xs text-primary mt-2 font-medium">
              Focus keys: <span className="font-mono">{hovered.rowKeys}</span>
            </p>
          )}
        </motion.div>

        {/* Lesson cards */}
        <div className="space-y-4">
          {ROW_LESSONS.map((lesson, i) => {
            const p = progress[lesson.id] || { letter: 0, word: 0, paragraph: 0 };
            const done = lessonRoundsCompleted(p);
            const complete = isLessonComplete(p);
            const unlocked = isLessonUnlocked(lesson.id, progress);
            const pct = (done / ROUNDS_PER_LESSON) * 100;
            const prevNeeded = lesson.id > 1 ? UNLOCK_THRESHOLD - enabledRoundsCompleted(progress[lesson.id - 1] || { letter: 0, word: 0, paragraph: 0 }) : 0;

            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + i * 0.06 }}
                data-testid={`lesson-card-${lesson.id}`}
                onMouseEnter={() => setHoverLesson(lesson.id)}
                onMouseLeave={() => setHoverLesson(null)}
              >
                <div
                  className={`rounded-2xl bg-card border transition-all duration-300 overflow-hidden ${
                    complete
                      ? "border-green-500/40 shadow-[0_0_24px_rgba(34,197,94,0.15)]"
                      : !unlocked
                      ? "border-border/30 opacity-70"
                      : "border-border/60 hover:border-primary/40"
                  }`}
                >
                  <div className="p-5 sm:p-6 flex items-center gap-4 sm:gap-5">
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${lesson.color} flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-lg ${
                        !unlocked ? "grayscale" : ""
                      }`}
                    >
                      {complete ? "✅" : lesson.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                          Lesson {lesson.id}
                        </span>
                        {complete && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Complete
                          </span>
                        )}
                        {!unlocked && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-muted/30 text-muted-foreground border border-border/50 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Locked
                          </span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-black mb-1 truncate">{lesson.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">{lesson.description}</p>

                      {/* Phase pill row */}
                      <div className="flex gap-1.5 flex-wrap text-[10px] sm:text-[11px] font-semibold">
                        {(["letter", "word", "paragraph"] as const).map((phase) => (
                          <span
                            key={phase}
                            className={`px-2 py-0.5 rounded-md border ${
                              p[phase] >= 10
                                ? "bg-green-500/10 border-green-500/30 text-green-400"
                                : p[phase] > 0
                                ? "bg-primary/10 border-primary/30 text-primary"
                                : "bg-white/5 border-border/40 text-muted-foreground"
                            }`}
                          >
                            {phase === "letter" ? "Letter" : phase === "word" ? "Word" : "Paragraph"} {p[phase]}/10
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {!unlocked ? (
                        <Button
                          size="sm"
                          disabled
                          className="bg-muted/30 text-muted-foreground gap-1.5 cursor-not-allowed"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          Locked
                        </Button>
                      ) : (
                        <Link href={`/lessons/${lesson.id}`}>
                          <Button
                            size="sm"
                            className={`gap-1.5 font-bold ${
                              complete
                                ? "bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25"
                                : done > 0
                                ? `bg-gradient-to-r ${lesson.color} text-white shadow-lg hover:opacity-90`
                                : "bg-white/5 border border-border/60 text-foreground hover:bg-white/10"
                            }`}
                          >
                            {complete ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" /> Replay
                              </>
                            ) : done > 0 ? (
                              <>
                                <Sparkles className="w-3.5 h-3.5" /> Continue
                              </>
                            ) : (
                              <>
                                <ChevronRight className="w-3.5 h-3.5" /> Start
                              </>
                            )}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Lesson progress bar */}
                  <div className="h-1.5 bg-border/25">
                    <div
                      className={`h-full bg-gradient-to-r ${lesson.color} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Unlock hint */}
                  {!unlocked && prevNeeded > 0 && (
                    <div className="px-5 sm:px-6 py-2 text-[11px] text-muted-foreground bg-muted/10 border-t border-border/30">
                      Complete {prevNeeded} more round{prevNeeded === 1 ? "" : "s"} of Lesson {lesson.id - 1} to unlock.
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-center text-xs text-muted-foreground"
        >
          Progress is saved on this device so you can resume anytime.
        </motion.div>
      </div>
    </div>
  );
}

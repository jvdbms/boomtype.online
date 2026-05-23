import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Zap, Crown, Clock, Target, CheckCircle2, ChevronRight, Star, Trophy, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import KeyboardVisualizer from "@/components/KeyboardVisualizer";
import { getTotalXP } from "@/lib/storage";

const lessons = [
  {
    id: 1,
    title: "Home Row Mastery",
    description: "Keep fingers on ASDF & JKL; — the foundation of every fast typist.",
    tip: "Never lift your wrists off the desk.",
    difficulty: "Beginner",
    duration: 30,
    focus: "ASDF JKL;",
    premium: false,
    icon: "🏠",
    color: "from-green-500 to-emerald-600",
    borderGlow: "shadow-[0_0_20px_rgba(34,197,94,0.25)]",
    category: "home",
    highlightKeys: "asdf",
    xpReward: 50,
  },
  {
    id: 2,
    title: "Top Row Speed",
    description: "Reach QWERTY and YUIOP without looking — unlock the full keyboard.",
    tip: "Keep pinkies anchored on Q and P.",
    difficulty: "Beginner",
    duration: 30,
    focus: "QWERTY YUIOP",
    premium: false,
    icon: "⬆️",
    color: "from-blue-500 to-cyan-600",
    borderGlow: "shadow-[0_0_20px_rgba(59,130,246,0.25)]",
    category: "top",
    highlightKeys: "qwerty",
    xpReward: 60,
  },
  {
    id: 7,
    title: "Bottom Row Basics",
    description: "Master ZXCV and BNM with your pinky and ring fingers.",
    tip: "Don't curl fingers — reach naturally.",
    difficulty: "Beginner",
    duration: 30,
    focus: "ZXCV BNM",
    premium: false,
    icon: "⬇️",
    color: "from-teal-500 to-cyan-600",
    borderGlow: "shadow-[0_0_20px_rgba(20,184,166,0.25)]",
    category: "bottom",
    highlightKeys: "zxcv",
    xpReward: 60,
  },
  {
    id: 3,
    title: "Number Row Precision",
    description: "Conquer digits without looking down — critical for data entry.",
    tip: "Start with your left index on the 4 key.",
    difficulty: "Intermediate",
    duration: 30,
    focus: "1234567890",
    premium: false,
    icon: "🔢",
    color: "from-yellow-500 to-amber-600",
    borderGlow: "shadow-[0_0_20px_rgba(234,179,8,0.25)]",
    category: "numbers",
    highlightKeys: "",
    xpReward: 80,
  },
  {
    id: 4,
    title: "Speed Drills",
    description: "Type the most common 200 English words at maximum velocity.",
    tip: "Aim for a 5 WPM increase each session.",
    difficulty: "Intermediate",
    duration: 60,
    focus: "Common words",
    premium: false,
    icon: "⚡",
    color: "from-orange-500 to-red-600",
    borderGlow: "shadow-[0_0_20px_rgba(249,115,22,0.25)]",
    category: "all",
    highlightKeys: "",
    xpReward: 100,
  },
  {
    id: 5,
    title: "Advanced Punctuation",
    description: "Master commas, semicolons, quotes, and special characters.",
    tip: "Never use two spaces after punctuation.",
    difficulty: "Pro",
    duration: 60,
    focus: "!@#$%,;:'\"",
    premium: true,
    icon: "✍️",
    color: "from-purple-500 to-violet-600",
    borderGlow: "shadow-[0_0_20px_rgba(139,92,246,0.25)]",
    category: "punctuation",
    highlightKeys: "",
    xpReward: 150,
  },
  {
    id: 6,
    title: "Code Typing",
    description: "Brackets, braces, symbols — everything a developer types daily.",
    tip: "Code typing: expect 30–40% lower WPM than prose.",
    difficulty: "Master",
    duration: 60,
    focus: "{}[]()<>",
    premium: true,
    icon: "💻",
    color: "from-pink-500 to-rose-600",
    borderGlow: "shadow-[0_0_20px_rgba(236,72,153,0.25)]",
    category: "advanced",
    highlightKeys: "",
    xpReward: 200,
  },
];

const COMPLETED_KEY = "boomtype_completed_lessons";

function getCompleted(): number[] {
  try { return JSON.parse(localStorage.getItem(COMPLETED_KEY) || "[]"); } catch { return []; }
}

const difficultyBadge: Record<string, string> = {
  Beginner:     "bg-green-500/15 text-green-400 border-green-500/30",
  Intermediate: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Pro:          "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Master:       "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
};

export default function Lessons() {
  const [completed, setCompleted] = useState<number[]>([]);
  const [hoverLesson, setHoverLesson] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "free" | "premium">("all");
  const [drillFilter, setDrillFilter] = useState<string>("all");
  const xp = getTotalXP();

  useEffect(() => {
    document.title = "Typing Lessons | BoomType — Learn to Type Faster";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Structured typing lessons from home row to advanced code. Build WPM systematically.");
    setCompleted(getCompleted());
  }, []);

  const DRILL_TABS = [
    { id: "all",         label: "All Drills",  emoji: "📋" },
    { id: "home",        label: "Home Row",    emoji: "🏠" },
    { id: "top",         label: "Top Row",     emoji: "⬆️" },
    { id: "bottom",      label: "Bottom Row",  emoji: "⬇️" },
    { id: "numbers",     label: "Numbers",     emoji: "🔢" },
    { id: "punctuation", label: "Punctuation", emoji: "✍️" },
    { id: "advanced",    label: "Code",        emoji: "💻" },
  ];

  const hoveredLesson = lessons.find(l => l.id === hoverLesson);
  const byDrill = drillFilter === "all" ? lessons : lessons.filter(l => l.category === drillFilter);
  const filtered = (activeFilter === "all" ? byDrill
    : activeFilter === "free" ? byDrill.filter(l => !l.premium)
    : byDrill.filter(l => l.premium));

  const completedCount = completed.filter(id => lessons.find(l => l.id === id)).length;
  const freeCount = lessons.filter(l => !l.premium).length;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-4">
            <Trophy className="w-4 h-4" />
            Typing Master Path
          </div>
          <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-white via-blue-100 to-accent bg-clip-text text-transparent">
            Level Up Your Typing
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Follow the structured path from total beginner to typing master — one lesson at a time.
          </p>
        </motion.div>

        {/* Progress Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <div className="rounded-2xl bg-card border border-border/60 p-5 text-center">
            <div className="text-3xl font-black text-primary mb-1">{completedCount}</div>
            <div className="text-xs text-muted-foreground">Lessons Done</div>
            <div className="mt-2 h-1.5 bg-border/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700"
                style={{ width: `${(completedCount / lessons.length) * 100}%` }}
              />
            </div>
          </div>
          <div className="rounded-2xl bg-card border border-border/60 p-5 text-center">
            <div className="text-3xl font-black text-yellow-400 mb-1">{xp.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total XP Earned</div>
            <div className="flex justify-center mt-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 opacity-70 -ml-0.5" />
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 opacity-40 -ml-0.5" />
            </div>
          </div>
          <div className="rounded-2xl bg-card border border-border/60 p-5 text-center">
            <div className="text-3xl font-black text-orange-400 mb-1">{freeCount - completedCount > 0 ? freeCount - completedCount : "🎉"}</div>
            <div className="text-xs text-muted-foreground">
              {freeCount - completedCount > 0 ? "Lessons Left" : "All Free Done!"}
            </div>
            <div className="flex justify-center mt-2">
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
          </div>
        </motion.div>

        {/* Keyboard Preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <KeyboardVisualizer highlightKey={hoveredLesson?.highlightKeys?.[0]} />
          {hoverLesson && (
            <p className="text-center text-xs text-primary mt-2 font-medium">
              Hover focus: {hoveredLesson?.focus}
            </p>
          )}
        </motion.div>

        {/* Drill Category Tabs */}
        <div className="mb-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="w-3 h-px bg-border/60 inline-block" />
            Filter by drill type
            <span className="flex-1 h-px bg-border/60" />
          </p>
          <div className="flex flex-wrap gap-2">
            {DRILL_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setDrillFilter(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  drillFilter === tab.id
                    ? "bg-accent/15 text-accent border-accent/30"
                    : "bg-card border-border/40 text-muted-foreground hover:text-foreground hover:border-border/70"
                }`}
              >
                <span>{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(["all", "free", "premium"] as const).map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold border transition-all capitalize ${
                activeFilter === f
                  ? "bg-primary/15 text-primary border-primary/30"
                  : "bg-card border-border/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? `All (${byDrill.length})` : f === "free" ? `Free (${byDrill.filter(l => !l.premium).length})` : `Premium (${byDrill.filter(l => l.premium).length})`}
            </button>
          ))}
        </div>

        {/* Lesson Path */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary/30 via-accent/20 to-transparent hidden sm:block" />

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((lesson, i) => {
                const isDone = completed.includes(lesson.id);
                const isLocked = lesson.premium;
                const isNext = !isDone && !isLocked && completed.length === i;

                return (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: i * 0.07 }}
                    className="relative sm:pl-20"
                    data-testid={`lesson-card-${lesson.id}`}
                    onMouseEnter={() => setHoverLesson(lesson.id)}
                    onMouseLeave={() => setHoverLesson(null)}
                  >
                    {/* Step dot */}
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl hidden sm:flex items-center justify-center text-2xl border-2 transition-all duration-300 z-10 ${
                      isDone ? "bg-green-500/20 border-green-500/50 shadow-[0_0_16px_rgba(34,197,94,0.3)]" :
                      isNext ? "bg-primary/20 border-primary/50 shadow-[0_0_16px_rgba(99,102,241,0.35)] animate-pulse" :
                      isLocked ? "bg-card border-border/30 grayscale" :
                      "bg-card border-border/40"
                    }`}>
                      {isDone ? "✅" : lesson.icon}
                    </div>

                    {/* Card */}
                    <div className={`rounded-2xl bg-card border transition-all duration-300 overflow-hidden ${
                      isDone ? "border-green-500/30" :
                      isNext ? "border-primary/40 shadow-[0_0_24px_rgba(99,102,241,0.2)]" :
                      isLocked ? "border-border/30 opacity-75" :
                      "border-border/60 hover:border-border"
                    } ${hoverLesson === lesson.id && !isLocked ? lesson.borderGlow : ""}`}
                    >
                      <div className="p-6 flex items-center gap-5">
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${difficultyBadge[lesson.difficulty]}`}>
                              {lesson.difficulty}
                            </span>
                            {isDone && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/30 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Completed
                              </span>
                            )}
                            {isNext && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 flex items-center gap-1">
                                <Flame className="w-3 h-3" /> Up Next
                              </span>
                            )}
                            {isLocked && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 flex items-center gap-1">
                                <Crown className="w-3 h-3" /> Premium
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-black mb-1">{lesson.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{lesson.description}</p>
                          {hoverLesson === lesson.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="flex items-start gap-2 text-xs text-primary/90 bg-primary/5 border border-primary/15 rounded-lg px-3 py-2 mb-3"
                            >
                              <span className="text-primary font-bold shrink-0">💡 Tip:</span>
                              {lesson.tip}
                            </motion.div>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{lesson.duration}s</span>
                            <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" />{lesson.focus}</span>
                            <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                              <Star className="w-3.5 h-3.5 fill-yellow-400" />+{lesson.xpReward} XP
                            </span>
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="shrink-0">
                          {isLocked ? (
                            <Link href="/premium">
                              <Button size="sm" className="bg-gradient-to-r from-primary to-accent text-white font-bold gap-1.5 shadow-lg">
                                <Lock className="w-3.5 h-3.5" />
                                Unlock
                              </Button>
                            </Link>
                          ) : (
                            <Link href={`/lessons/${lesson.id}`}>
                              <Button
                                size="sm"
                                className={`gap-1.5 font-bold transition-all duration-200 ${
                                  isDone
                                    ? "bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25"
                                    : isNext
                                    ? `bg-gradient-to-r ${lesson.color} text-white shadow-lg hover:opacity-90`
                                    : "bg-white/5 border border-border/60 text-foreground hover:bg-white/10"
                                }`}
                              >
                                {isDone ? (
                                  <><CheckCircle2 className="w-3.5 h-3.5" /> Replay</>
                                ) : (
                                  <><Zap className="w-3.5 h-3.5" /> {isNext ? "Start Now" : "Practice"}</>
                                )}
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Progress bar if it's the "next" lesson */}
                      {isNext && (
                        <div className="h-1 bg-border/30">
                          <div className="h-full bg-gradient-to-r from-primary to-accent w-0 animate-[grow_2s_ease-in-out_infinite_alternate]" />
                        </div>
                      )}
                    </div>

                    {/* Connector arrow between cards */}
                    {i < filtered.length - 1 && (
                      <div className="hidden sm:flex justify-start pl-5 py-1">
                        <ChevronRight className="w-4 h-4 text-border/60 rotate-90" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Premium Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 relative rounded-3xl overflow-hidden p-8 text-center border border-accent/20"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/10" />
          <div className="relative z-10">
            <Crown className="w-12 h-12 text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-black mb-2">Unlock Pro + Master Lessons</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Advanced Punctuation, Code Typing, detailed analytics, no ads, certificates.
              <span className="text-accent font-semibold"> Only $4.99/mo</span>
            </p>
            <Link href="/premium">
              <Button className="bg-gradient-to-r from-primary to-accent text-white font-black gap-2 px-10 py-5 h-auto text-base hover:opacity-90 shadow-xl">
                <Crown className="w-5 h-5" />
                Go Premium — $4.99/mo
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Keyboard, GraduationCap, Trophy, Star, Flame, Target, CheckCircle2,
  TrendingUp, Zap, ChevronRight, Play, CloudRain, Sword, CircleDot,
  Wrench, Layers, Timer, Wind, Lock, BookOpen, Download, LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTotalXP, getStreak, getHighScore } from "@/lib/storage";

const COMPLETED_KEY = "boomtype_completed_lessons";
function getCompleted(): number[] {
  try { return JSON.parse(localStorage.getItem(COMPLETED_KEY) || "[]"); } catch { return []; }
}

const LESSONS = [
  { id: 1, title: "Home Row Mastery",     icon: "🏠", color: "from-green-500 to-emerald-600",  xp: 50,  focus: "ASDF JKL;",    premium: false },
  { id: 2, title: "Top Row Speed",        icon: "⬆️", color: "from-blue-500 to-cyan-600",      xp: 60,  focus: "QWERTY YUIOP", premium: false },
  { id: 7, title: "Bottom Row Basics",    icon: "⬇️", color: "from-teal-500 to-cyan-600",      xp: 60,  focus: "ZXCV BNM",     premium: false },
  { id: 3, title: "Number Row Precision", icon: "🔢", color: "from-yellow-500 to-amber-600",   xp: 75,  focus: "1234567890",   premium: false },
  { id: 4, title: "Speed Drills",         icon: "⚡", color: "from-orange-500 to-red-600",     xp: 100, focus: "Common words", premium: false },
  { id: 5, title: "Advanced Punctuation", icon: "✍️", color: "from-purple-500 to-violet-600",  xp: 120, focus: ",;:\"'!?",    premium: true  },
  { id: 6, title: "Code Typing",          icon: "💻", color: "from-pink-500 to-rose-600",      xp: 150, focus: "{}[]()<>",    premium: true  },
];

const GAMES = [
  { id: "word-rain",      title: "Word Rain",      icon: CloudRain, emoji: "🌧️", hsKey: "boomtype_wordrain_hs",      unit: "words", color: "text-blue-400",   bg: "from-blue-500/15 to-cyan-500/5",    border: "border-blue-500/25"   },
  { id: "zombie-attack",  title: "Zombie Attack",  icon: Sword,     emoji: "🧟", hsKey: "boomtype_zombie_hs",         unit: "kills", color: "text-red-400",    bg: "from-red-500/15 to-orange-500/5",   border: "border-red-500/25"    },
  { id: "speed-burst",    title: "Speed Burst",    icon: Zap,       emoji: "💥", hsKey: "boomtype_speedburst_hs",     unit: "pts",   color: "text-purple-400", bg: "from-purple-500/15 to-violet-500/5",border: "border-purple-500/25" },
  { id: "bubble-pop",     title: "Bubble Pop",     icon: CircleDot, emoji: "🫧", hsKey: "boomtype_bubblepop_hs",      unit: "pts",   color: "text-sky-400",    bg: "from-sky-500/15 to-cyan-500/5",     border: "border-sky-500/25"    },
  { id: "pipe-run",       title: "Pipe Run",       icon: Wrench,    emoji: "🔧", hsKey: "boomtype_piperun_hs",        unit: "words", color: "text-green-400",  bg: "from-green-500/15 to-teal-500/5",   border: "border-green-500/25"  },
  { id: "word-tetris",    title: "Word Tetris",    icon: Layers,    emoji: "🟦", hsKey: "boomtype_wordtetris_hs",     unit: "pts",   color: "text-indigo-400", bg: "from-indigo-500/15 to-blue-500/5",  border: "border-indigo-500/25" },
  { id: "alphabet-race",  title: "Alphabet Race",  icon: Timer,     emoji: "⚡", hsKey: "boomtype_alphabetrace_hs",   unit: "s",     color: "text-yellow-400", bg: "from-yellow-500/15 to-amber-500/5", border: "border-yellow-500/25" },
  { id: "cloud-race",     title: "Cloud Race",     icon: Wind,      emoji: "☁️", hsKey: "boomtype_cloudrace_hs",      unit: "words", color: "text-cyan-400",   bg: "from-cyan-500/15 to-sky-500/5",     border: "border-cyan-500/25"   },
];

const QUICK_ACTIONS = [
  { href: "/test",        icon: Keyboard,       label: "Quick Test",   sub: "60s speed test",          color: "from-primary to-blue-600",   textColor: "text-white" },
  { href: "/lessons/1",   icon: GraduationCap,  label: "Start Lesson", sub: "Home Row Mastery",        color: "from-green-500 to-emerald-600", textColor: "text-white" },
  { href: "/games",       icon: Zap,            label: "Play Games",   sub: "8 typing mini-games",     color: "from-purple-500 to-violet-600", textColor: "text-white" },
  { href: "/leaderboard", icon: Trophy,         label: "Leaderboard",  sub: "See global rankings",     color: "from-yellow-500 to-orange-500", textColor: "text-white" },
];

export default function Dashboard() {
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestWpm, setBestWpm] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [gameScores, setGameScores] = useState<Record<string, number>>({});

  useEffect(() => {
    document.title = "Dashboard | BoomType";
    setXp(getTotalXP());
    setStreak(getStreak().count);
    setBestWpm(getHighScore());
    setCompleted(getCompleted());
    const scores: Record<string, number> = {};
    GAMES.forEach(g => {
      const v = parseFloat(localStorage.getItem(g.hsKey) || "0");
      if (v > 0) scores[g.id] = v;
    });
    setGameScores(scores);
  }, []);

  const level = Math.floor(xp / 200) + 1;
  const levelNames = ["Beginner", "Novice", "Learner", "Practitioner", "Intermediate", "Advanced", "Expert", "Pro", "Master", "Legend"];
  const levelName = levelNames[Math.min(level - 1, levelNames.length - 1)];
  const xpProgress = ((xp % 200) / 200) * 100;
  const completedCount = completed.length;

  return (
    <div className="py-6 px-4 max-w-6xl mx-auto">
      {/* Page title */}
      <div className="flex items-center gap-2 mb-6">
        <LayoutDashboard className="w-5 h-5 text-primary" />
        <h1 className="text-2xl font-black">Dashboard</h1>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Star,         value: xp.toLocaleString(), label: "Total XP",     sub: `Level ${level} — ${levelName}`,         color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", fill: "fill-yellow-400" },
          { icon: Target,       value: `${bestWpm}`,        label: "Best WPM",     sub: bestWpm >= 80 ? "🔥 Excellent!" : bestWpm >= 50 ? "👍 Good" : "Keep practicing!", color: "text-primary",    bg: "bg-primary/10 border-primary/20",       fill: "" },
          { icon: CheckCircle2, value: `${completedCount}/7`,label: "Lessons Done",sub: completedCount === 7 ? "All complete! 🏆" : `${7 - completedCount} remaining`, color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20",   fill: "" },
          { icon: Flame,        value: `${streak}`,         label: "Day Streak",   sub: streak >= 7 ? "🔥 On fire!" : streak > 0 ? "Keep it up!" : "Start today!", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", fill: "" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className={`rounded-2xl border p-5 ${s.bg}`}
            >
              <Icon className={`w-5 h-5 ${s.color} mb-2`} />
              <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-sm font-semibold mt-0.5">{s.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.sub}</div>
            </motion.div>
          );
        })}
      </div>

      {/* XP progress to next level */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-2xl bg-card border border-border/60 p-5 mb-8"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`px-2.5 py-1 rounded-full text-xs font-black bg-primary/15 text-primary border border-primary/25`}>Lv.{level} {levelName}</div>
            <span className="text-sm text-muted-foreground">{xp % 200} / 200 XP</span>
          </div>
          <span className="text-xs text-muted-foreground">{200 - (xp % 200)} XP to Level {level + 1}</span>
        </div>
        <div className="h-3 bg-border/30 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
          />
        </div>
      </motion.div>

      {/* Quick actions */}
      <h2 className="text-lg font-black mb-4 flex items-center gap-2">
        <Zap className="w-4 h-4 text-primary" />Quick Start
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {QUICK_ACTIONS.map((a, i) => {
          const Icon = a.icon;
          return (
            <motion.div key={a.href} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 * i }}>
              <Link href={a.href}>
                <div className={`rounded-2xl bg-gradient-to-br ${a.color} p-5 cursor-pointer hover:scale-105 hover:shadow-lg transition-all duration-200 group`}>
                  <Icon className="w-6 h-6 text-white/90 mb-3" />
                  <div className="text-white font-black text-base leading-tight">{a.label}</div>
                  <div className="text-white/70 text-xs mt-1">{a.sub}</div>
                  <ChevronRight className="w-4 h-4 text-white/50 mt-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Lessons progress */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl bg-card border border-border/60 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />Lessons
            </h2>
            <Link href="/lessons">
              <span className="text-xs text-primary hover:underline flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
          <div className="space-y-2">
            {LESSONS.map((lesson, i) => {
              const done = completed.includes(lesson.id);
              return (
                <motion.div key={lesson.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                  <Link href={`/lessons/${lesson.id}`}>
                    <div className={`flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/5 cursor-pointer ${done ? "opacity-70" : ""}`}>
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${lesson.color} flex items-center justify-center text-base shrink-0`}>
                        {lesson.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate">{lesson.title}</div>
                        <div className="text-xs text-muted-foreground">{lesson.focus}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {lesson.premium && !done && (
                          <Lock className="w-3.5 h-3.5 text-yellow-500" />
                        )}
                        {done
                          ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                          : <span className="text-xs text-yellow-400 font-bold">+{lesson.xp}</span>
                        }
                        <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Games scores */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl bg-card border border-border/60 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />Games
            </h2>
            <Link href="/games">
              <span className="text-xs text-primary hover:underline flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {GAMES.map((game, i) => {
              const hs = gameScores[game.id] || 0;
              const Icon = game.icon;
              return (
                <motion.div key={game.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 * i }}>
                  <Link href={`/games/${game.id}`}>
                    <div className={`flex items-center gap-2 p-2.5 rounded-xl bg-gradient-to-br ${game.bg} border ${game.border} cursor-pointer hover:opacity-90 transition-opacity`}>
                      <span className="text-lg">{game.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-bold ${game.color} truncate`}>{game.title}</div>
                        {hs > 0
                          ? <div className="text-xs text-muted-foreground font-mono">{game.id === "alphabet-race" ? `${hs}s` : `${Math.round(hs)} ${game.unit}`}</div>
                          : <div className="text-xs text-muted-foreground/40">Not played</div>
                        }
                      </div>
                      {hs > 0 && <Trophy className="w-3 h-3 text-yellow-400 shrink-0" />}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Help section */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="rounded-2xl bg-gradient-to-br from-primary/8 to-accent/5 border border-primary/15 p-6"
      >
        <h2 className="text-lg font-black mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />All Features
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[
            { href: "/test",        icon: Keyboard,       label: "Typing Test",    desc: "30s or 60s WPM test" },
            { href: "/lessons",     icon: GraduationCap,  label: "7 Lessons",      desc: "Structured learning path" },
            { href: "/games",       icon: Zap,            label: "8 Games",        desc: "Fun typing mini-games" },
            { href: "/leaderboard", icon: Trophy,         label: "Leaderboard",    desc: "Global rankings" },
            { href: "/blog",        icon: BookOpen,       label: "Blog & Tips",    desc: "Improve faster" },
            { href: "/download",    icon: Download,       label: "Desktop App",    desc: "Install as PWA" },
            { href: "/premium",     icon: Star,           label: "Premium",        desc: "Unlock all features" },
            { href: "/results",     icon: TrendingUp,     label: "My Results",     desc: "Latest test scores" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div className="flex items-start gap-2.5 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">{item.label}</div>
                    <div className="text-xs text-muted-foreground leading-tight">{item.desc}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

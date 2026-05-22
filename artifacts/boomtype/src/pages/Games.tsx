import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Gamepad2, CloudRain, Sword, Zap, Star, Trophy, Layers, Wrench, AlignJustify, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";

const HIGH_SCORE_KEYS: Record<string, string> = {
  "word-rain":      "boomtype_wordrain_hs",
  "zombie-attack":  "boomtype_zombie_hs",
  "speed-burst":    "boomtype_speedburst_hs",
  "bubble-pop":     "boomtype_bubblepop_hs",
  "pipe-run":       "boomtype_piperun_hs",
  "word-tetris":    "boomtype_wordtetris_hs",
  "alphabet-race":  "boomtype_alphabetrace_hs",
  "cloud-race":     "boomtype_cloudrace_hs",
};

const SCORE_UNIT: Record<string, string> = {
  "word-rain":     "words",
  "zombie-attack": "kills",
  "speed-burst":   "pts",
  "bubble-pop":    "pts",
  "pipe-run":      "cleared",
  "word-tetris":   "pts",
  "alphabet-race": "s best",
  "cloud-race":    "words",
};

const GAMES = [
  {
    id: "word-rain",
    title: "Word Rain",
    description: "Words fall from the sky — type them before they hit the ground! Speed increases every wave.",
    icon: CloudRain,
    color: "from-blue-500/20 to-cyan-500/10",
    border: "border-blue-500/30",
    textColor: "text-blue-400",
    glowColor: "hover:shadow-[0_0_20px_rgba(59,130,246,0.25)]",
    difficulty: "Easy",
    diffColor: "text-green-400",
    emoji: "🌧️",
    tag: "Classic",
  },
  {
    id: "zombie-attack",
    title: "Zombie Attack",
    description: "Zombies march toward you with word labels — type to destroy them before they reach you!",
    icon: Sword,
    color: "from-red-500/20 to-orange-500/10",
    border: "border-red-500/30",
    textColor: "text-red-400",
    glowColor: "hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]",
    difficulty: "Medium",
    diffColor: "text-yellow-400",
    emoji: "🧟",
    tag: "Classic",
  },
  {
    id: "speed-burst",
    title: "Speed Burst",
    description: "Pop floating word bubbles before they disappear. Build combos for huge score multipliers!",
    icon: Zap,
    color: "from-purple-500/20 to-violet-500/10",
    border: "border-purple-500/30",
    textColor: "text-purple-400",
    glowColor: "hover:shadow-[0_0_20px_rgba(139,92,246,0.25)]",
    difficulty: "Hard",
    diffColor: "text-red-400",
    emoji: "💥",
    tag: "Classic",
  },
  {
    id: "bubble-pop",
    title: "Bubble Pop",
    description: "Colorful bubbles drift around the screen. Type the word on each bubble to pop it. Build combos!",
    icon: Star,
    color: "from-sky-500/20 to-cyan-400/10",
    border: "border-sky-500/30",
    textColor: "text-sky-400",
    glowColor: "hover:shadow-[0_0_20px_rgba(14,165,233,0.25)]",
    difficulty: "Easy",
    diffColor: "text-green-400",
    emoji: "🫧",
    tag: "New",
  },
  {
    id: "pipe-run",
    title: "Pipe Run",
    description: "Words flow through 4 pipe lanes — type them to clear before they escape the right side!",
    icon: Wrench,
    color: "from-green-500/20 to-teal-500/10",
    border: "border-green-500/30",
    textColor: "text-green-400",
    glowColor: "hover:shadow-[0_0_20px_rgba(34,197,94,0.25)]",
    difficulty: "Medium",
    diffColor: "text-yellow-400",
    emoji: "🔧",
    tag: "New",
  },
  {
    id: "word-tetris",
    title: "Word Tetris",
    description: "Words fall like Tetris blocks — type them to clear. Miss them and they stack up. Don't overflow!",
    icon: Layers,
    color: "from-indigo-500/20 to-blue-500/10",
    border: "border-indigo-500/30",
    textColor: "text-indigo-400",
    glowColor: "hover:shadow-[0_0_20px_rgba(99,102,241,0.25)]",
    difficulty: "Hard",
    diffColor: "text-red-400",
    emoji: "🟦",
    tag: "New",
  },
  {
    id: "alphabet-race",
    title: "Alphabet Race",
    description: "Type A to Z (or any sequence) as fast as possible. Race your personal best time with multiple modes!",
    icon: AlignJustify,
    color: "from-yellow-500/20 to-amber-500/10",
    border: "border-yellow-500/30",
    textColor: "text-yellow-400",
    glowColor: "hover:shadow-[0_0_20px_rgba(234,179,8,0.25)]",
    difficulty: "Easy",
    diffColor: "text-green-400",
    emoji: "⚡",
    tag: "New",
  },
  {
    id: "cloud-race",
    title: "Cloud Race",
    description: "Type words to propel your cloud across the sky. Race the CPU cloud — first to the finish wins!",
    icon: Wind,
    color: "from-cyan-500/20 to-sky-500/10",
    border: "border-cyan-500/30",
    textColor: "text-cyan-400",
    glowColor: "hover:shadow-[0_0_20px_rgba(6,182,212,0.25)]",
    difficulty: "Medium",
    diffColor: "text-yellow-400",
    emoji: "☁️",
    tag: "New",
  },
];

const DIFFICULTY_ORDER: Record<string, number> = { Easy: 0, Medium: 1, Hard: 2 };

export default function Games() {
  const [highScores, setHighScores] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<"all" | "Easy" | "Medium" | "Hard">("all");

  useEffect(() => {
    document.title = "Typing Games | BoomType — Play & Improve";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Play 8 fun typing games on BoomType — Bubble Pop, Word Tetris, Cloud Race, Alphabet Race, and more!");
    const scores: Record<string, number> = {};
    for (const [gameId, key] of Object.entries(HIGH_SCORE_KEYS)) {
      const val = parseFloat(localStorage.getItem(key) || "0");
      if (val > 0) scores[gameId] = val;
    }
    setHighScores(scores);
  }, []);

  const filtered = filter === "all" ? GAMES : GAMES.filter(g => g.difficulty === filter);

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Gamepad2 className="w-4 h-4" />
            Typing Games
          </div>
          <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-white to-accent bg-clip-text text-transparent">
            Play & Improve
          </h1>
          <p className="text-muted-foreground text-lg">8 unique typing games — all focused on studied key sets</p>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {(["all", "Easy", "Medium", "Hard"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold border transition-all capitalize ${filter === f ? "bg-primary/15 text-primary border-primary/30" : "bg-card border-border/40 text-muted-foreground hover:text-foreground"}`}
            >
              {f === "all" ? `All Games (${GAMES.length})` : `${f} (${GAMES.filter(g => g.difficulty === f).length})`}
            </button>
          ))}
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {filtered.map((game, i) => {
            const Icon = game.icon;
            const hs = highScores[game.id];
            const unit = SCORE_UNIT[game.id];
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`rounded-2xl bg-gradient-to-br ${game.color} border ${game.border} p-5 flex flex-col transition-all duration-300 ${game.glowColor}`}
              >
                {/* Tag */}
                {game.tag === "New" && (
                  <div className="self-start mb-2 px-2 py-0.5 rounded-full bg-accent/20 border border-accent/30 text-accent text-[10px] font-black uppercase tracking-wide">
                    NEW
                  </div>
                )}

                <div className="text-4xl mb-3">{game.emoji}</div>
                <div className="mb-1">
                  <span className={`text-xs font-bold uppercase tracking-wide ${game.diffColor}`}>
                    {game.difficulty}
                  </span>
                </div>
                <h2 className={`text-lg font-black mb-2 ${game.textColor}`}>{game.title}</h2>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">{game.description}</p>

                {hs > 0 && (
                  <div className={`flex items-center gap-1.5 text-xs font-bold mb-3 ${game.textColor}`}>
                    <Trophy className="w-3.5 h-3.5" />
                    Best: {game.id === "alphabet-race" ? `${hs}s` : `${Math.round(hs)} ${unit}`}
                  </div>
                )}

                <Link href={`/games/${game.id}`}>
                  <Button className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold text-sm gap-1.5 py-2 h-auto hover:opacity-90">
                    <Icon className="w-3.5 h-3.5" />
                    Play Now
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Why play */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-card border border-border/60 p-6"
        >
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Why Play Typing Games?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Star,     label: "Build Speed",     desc: "Game pressure forces faster reaction — natural WPM training" },
              { icon: Zap,      label: "Boost Accuracy",  desc: "Mistakes cost you in-game — powerful accuracy incentive" },
              { icon: Gamepad2, label: "Stay Motivated",  desc: "Fun engagement keeps you practicing 3× longer" },
            ].map(({ icon: I, label, desc }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                  <I className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-sm mb-0.5">{label}</div>
                  <div className="text-xs text-muted-foreground">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Gamepad2, CloudRain, Sword, Zap, Star, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

const HIGH_SCORE_KEYS: Record<string, string> = {
  "word-rain": "boomtype_wordrain_hs",
  "zombie-attack": "boomtype_zombie_hs",
  "speed-burst": "boomtype_speedburst_hs",
};

const SCORE_UNIT: Record<string, string> = {
  "word-rain": "words",
  "zombie-attack": "kills",
  "speed-burst": "pts",
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
    difficulty: "Easy",
    diffColor: "text-green-400",
    emoji: "🌧️",
  },
  {
    id: "zombie-attack",
    title: "Zombie Attack",
    description: "Zombies march toward you with word labels — type to destroy them before they reach you!",
    icon: Sword,
    color: "from-red-500/20 to-orange-500/10",
    border: "border-red-500/30",
    textColor: "text-red-400",
    difficulty: "Medium",
    diffColor: "text-yellow-400",
    emoji: "🧟",
  },
  {
    id: "speed-burst",
    title: "Speed Burst",
    description: "Pop floating word bubbles before they disappear. Build combos for huge score multipliers!",
    icon: Zap,
    color: "from-purple-500/20 to-violet-500/10",
    border: "border-purple-500/30",
    textColor: "text-purple-400",
    difficulty: "Hard",
    diffColor: "text-red-400",
    emoji: "💥",
  },
];

export default function Games() {
  const [highScores, setHighScores] = useState<Record<string, number>>({});

  useEffect(() => {
    document.title = "Typing Games | BoomType — Play & Improve";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Play fun typing games on BoomType. Word Rain, Zombie Attack, and Speed Burst — improve your WPM while having fun!");

    const scores: Record<string, number> = {};
    for (const [gameId, key] of Object.entries(HIGH_SCORE_KEYS)) {
      const val = parseInt(localStorage.getItem(key) || "0", 10);
      if (val > 0) scores[gameId] = val;
    }
    setHighScores(scores);
  }, []);

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Gamepad2 className="w-4 h-4" />
            Typing Games
          </div>
          <h1 className="text-4xl font-black mb-3">Play & Improve</h1>
          <p className="text-muted-foreground text-lg">Level up your typing speed through fun mini-games</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {GAMES.map((game, i) => {
            const Icon = game.icon;
            const hs = highScores[game.id];
            const unit = SCORE_UNIT[game.id];
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl bg-gradient-to-br ${game.color} border ${game.border} p-6 flex flex-col`}
              >
                <div className="text-4xl mb-4">{game.emoji}</div>
                <div className="mb-1">
                  <span className={`text-xs font-bold uppercase tracking-wide ${game.diffColor}`}>
                    {game.difficulty}
                  </span>
                </div>
                <h2 className={`text-xl font-black mb-2 ${game.textColor}`}>{game.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{game.description}</p>
                {hs > 0 && (
                  <div className={`flex items-center gap-1.5 text-xs font-bold mb-3 ${game.textColor}`}>
                    <Trophy className="w-3.5 h-3.5" />
                    Best: {hs} {unit}
                  </div>
                )}
                <Link href={`/games/${game.id}`}>
                  <Button className={`w-full bg-gradient-to-r from-primary to-accent text-white font-semibold gap-2`}>
                    <Icon className="w-4 h-4" />
                    Play Now
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>

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
              { icon: Star, label: "Build Speed", desc: "Game pressure forces faster typing reaction" },
              { icon: Zap, label: "Boost Accuracy", desc: "Mistakes cost you in-game — natural accuracy training" },
              { icon: Gamepad2, label: "Stay Motivated", desc: "Fun engagement keeps you practicing longer" },
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

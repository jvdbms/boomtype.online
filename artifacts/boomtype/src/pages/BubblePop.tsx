import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WORD_LIST, LESSON_WORDS } from "@/lib/words";
import { useGameSounds } from "@/hooks/useGameSounds";

const HS_KEY = "boomtype_bubblepop_hs";
const BUBBLE_COLORS = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-violet-500",
  "from-pink-500 to-rose-500",
  "from-green-500 to-emerald-500",
  "from-orange-500 to-amber-500",
  "from-yellow-400 to-orange-400",
  "from-teal-500 to-cyan-400",
];
const KEY_SETS: Record<string, { label: string; words: string[] }> = {
  all:    { label: "All Words",  words: WORD_LIST },
  home:   { label: "Home Row",   words: LESSON_WORDS[1] },
  top:    { label: "Top Row",    words: LESSON_WORDS[2] },
  speed:  { label: "Speed",      words: LESSON_WORDS[4] },
};

interface Bubble {
  id: number;
  word: string;
  x: number; y: number;
  vx: number; vy: number;
  color: string;
  radius: number;
  popping: boolean;
}

let nextId = 1;
function makeWord(pool: string[]): string {
  return pool[Math.floor(Math.random() * pool.length)];
}
function makeBubble(pool: string[]): Bubble {
  const r = 42 + Math.floor(Math.random() * 24);
  return {
    id: nextId++,
    word: makeWord(pool),
    x: 5 + Math.random() * 88,
    y: 5 + Math.random() * 75,
    vx: (Math.random() - 0.5) * 0.15,
    vy: (Math.random() - 0.5) * 0.15,
    color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
    radius: r,
    popping: false,
  };
}

export default function BubblePop() {
  const [gameState, setGameState] = useState<"idle" | "playing" | "over">("idle");
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem(HS_KEY) || "0", 10));
  const [keySet, setKeySet] = useState<keyof typeof KEY_SETS>("all");
  const [combo, setCombo] = useState(0);
  const [lastPop, setLastPop] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef<number>(0);
  const bubblesRef = useRef<Bubble[]>([]);
  const lastSpawnRef = useRef(0);
  const { playCorrect, playGameOver, playCombo } = useGameSounds();
  bubblesRef.current = bubbles;

  const startGame = useCallback(() => {
    const pool = KEY_SETS[keySet].words;
    const initial = Array.from({ length: 5 }, () => makeBubble(pool));
    setBubbles(initial);
    setInput("");
    setScore(0);
    setCombo(0);
    setTimeLeft(60);
    setLastPop("");
    setGameState("playing");
    lastSpawnRef.current = Date.now();
    inputRef.current?.focus();
  }, [keySet]);

  // Bubble physics loop
  useEffect(() => {
    if (gameState !== "playing") return;
    let last = performance.now();
    const pool = KEY_SETS[keySet].words;
    const tick = (now: number) => {
      const dt = now - last; last = now;
      const spawnInterval = Math.max(1800 - score * 5, 800);
      if (Date.now() - lastSpawnRef.current > spawnInterval && bubblesRef.current.filter(b => !b.popping).length < 12) {
        lastSpawnRef.current = Date.now();
        setBubbles(prev => [...prev.filter(b => !b.popping), makeBubble(pool)]);
      }
      setBubbles(prev => prev.map(b => {
        if (b.popping) return b;
        let { x, y, vx, vy } = b;
        x += vx * dt * 0.06;
        y += vy * dt * 0.06;
        const pad = (b.radius / 10);
        if (x < pad) { x = pad; vx = Math.abs(vx); }
        if (x > 100 - pad) { x = 100 - pad; vx = -Math.abs(vx); }
        if (y < pad) { y = pad; vy = Math.abs(vy); }
        if (y > 92 - pad) { y = 92 - pad; vy = -Math.abs(vy); }
        return { ...b, x, y, vx, vy };
      }));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [gameState, keySet, score]);

  // Timer
  useEffect(() => {
    if (gameState !== "playing") return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(t);
          setGameState("over");
          playGameOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [gameState]);

  // Save high score
  useEffect(() => {
    if (gameState === "over" && score > highScore) {
      setHighScore(score);
      localStorage.setItem(HS_KEY, score.toString());
    }
  }, [gameState, score]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    const typed = val.trim().toLowerCase();
    const match = bubblesRef.current.find(b => !b.popping && b.word.toLowerCase() === typed);
    if (match) {
      playCorrect();
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo >= 3) playCombo(newCombo);
      const pts = 10 * Math.max(1, Math.floor(newCombo / 3) + 1);
      setScore(prev => prev + pts);
      setLastPop(`+${pts}${newCombo >= 3 ? ` 🔥×${newCombo}` : ""}`);
      setBubbles(prev => prev.map(b => b.id === match.id ? { ...b, popping: true } : b));
      setTimeout(() => setBubbles(prev => prev.filter(b => b.id !== match.id)), 400);
      setInput("");
    } else {
      setCombo(0);
    }
  };

  return (
    <div className="min-h-screen py-6 px-4 flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <Link href="/games" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Games
          </Link>
          {gameState !== "idle" && (
            <div className="flex items-center gap-4">
              <div className="text-sm font-bold text-primary tabular-nums">{score} pts</div>
              <div className={`text-sm font-bold tabular-nums ${timeLeft <= 10 ? "text-red-400" : "text-muted-foreground"}`}>{timeLeft}s</div>
              {highScore > 0 && <div className="text-xs text-yellow-400 flex items-center gap-1"><Trophy className="w-3 h-3" />{highScore}</div>}
            </div>
          )}
        </div>

        <div className="text-center mb-4">
          <h1 className="text-3xl font-black mb-1">🫧 Bubble Pop</h1>
          <p className="text-muted-foreground text-sm">Type the words on the bubbles to pop them!</p>
        </div>

        {gameState === "idle" && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="rounded-2xl bg-card border border-border/60 p-8 max-w-sm w-full text-center">
              <div className="text-6xl mb-4">🫧</div>
              <h2 className="text-xl font-black mb-2">Bubble Pop</h2>
              <p className="text-muted-foreground text-sm mb-6">Pop bubbles by typing the words on them. Build combos for bonus points!</p>
              <div className="mb-5">
                <p className="text-xs text-muted-foreground mb-2 font-medium">KEY FOCUS</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {Object.entries(KEY_SETS).map(([k, v]) => (
                    <button key={k} onClick={() => setKeySet(k as keyof typeof KEY_SETS)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${keySet === k ? "bg-primary/15 border-primary/40 text-primary" : "bg-card border-border/40 text-muted-foreground hover:text-foreground"}`}
                    >{v.label}</button>
                  ))}
                </div>
              </div>
              {highScore > 0 && <p className="text-xs text-yellow-400 mb-4 flex items-center justify-center gap-1"><Trophy className="w-3 h-3" />Best: {highScore} pts</p>}
              <Button onClick={startGame} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold">Start Game</Button>
            </div>
          </motion.div>
        )}

        {gameState === "over" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex items-center justify-center">
            <div className="rounded-2xl bg-card border border-border/60 p-8 max-w-sm w-full text-center">
              <div className="text-5xl mb-4">🫧</div>
              <h2 className="text-2xl font-black mb-1">Time's Up!</h2>
              {score >= highScore && score > 0 && <p className="text-yellow-400 font-bold text-sm mb-3">🏆 New High Score!</p>}
              <div className="text-5xl font-black text-primary mb-1">{score}</div>
              <div className="text-muted-foreground text-sm mb-6">points</div>
              <div className="flex gap-3">
                <Button onClick={startGame} className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold gap-1.5">
                  <RefreshCw className="w-4 h-4" />Play Again
                </Button>
                <Link href="/games"><Button variant="outline" className="flex-1 border-border/60">All Games</Button></Link>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === "playing" && (
          <div className="flex-1 flex flex-col">
            {/* Game arena */}
            <div className="relative flex-1 rounded-2xl bg-gradient-to-br from-[hsl(220,47%,5%)] to-[hsl(263,40%,8%)] border border-border/60 overflow-hidden min-h-[360px]">
              {/* Combo flash */}
              <AnimatePresence>
                {lastPop && (
                  <motion.div key={lastPop + Date.now()}
                    initial={{ opacity: 1, y: 0, scale: 1 }} animate={{ opacity: 0, y: -40, scale: 1.3 }}
                    transition={{ duration: 0.7 }}
                    className="absolute top-4 left-1/2 -translate-x-1/2 z-20 text-yellow-400 font-black text-lg pointer-events-none"
                  >{lastPop}</motion.div>
                )}
              </AnimatePresence>

              {/* Bubbles */}
              <AnimatePresence>
                {bubbles.map(b => (
                  <motion.div key={b.id}
                    initial={{ scale: 0 }} animate={{ scale: b.popping ? 1.6 : 1 }} exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                    className={`absolute flex items-center justify-center rounded-full bg-gradient-to-br ${b.color} shadow-lg cursor-default select-none border-2 border-white/20`}
                    style={{ left: `${b.x}%`, top: `${b.y}%`, width: b.radius * 2, height: b.radius * 2, transform: "translate(-50%,-50%)" }}
                  >
                    <span className="text-white font-black text-xs text-center px-1 leading-tight drop-shadow"
                      style={{ fontSize: Math.max(10, Math.min(14, b.radius * 0.35)) }}
                    >{b.word}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Input */}
            <div className="mt-4">
              <input
                ref={inputRef}
                value={input}
                onChange={handleInput}
                className="w-full bg-card border border-border/60 focus:border-primary/60 rounded-2xl px-6 py-4 text-xl font-mono font-bold text-center outline-none transition-colors"
                placeholder="Type a word..."
                autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
              />
              {combo >= 3 && <p className="text-center text-orange-400 text-sm font-bold mt-2">🔥 {combo}x Combo!</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

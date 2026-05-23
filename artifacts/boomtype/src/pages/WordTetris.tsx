import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WORD_LIST, LESSON_WORDS } from "@/lib/words";
import { useGameSounds } from "@/hooks/useGameSounds";
import { addXP, awardGameBadge, calculateGameXP } from "@/lib/storage";

const HS_KEY = "boomtype_wordtetris_hs";
const GRID_COLS = 8;
const GRID_ROWS = 10;
const WORD_COLORS = [
  "bg-blue-500/80 border-blue-400",
  "bg-purple-500/80 border-purple-400",
  "bg-green-500/80 border-green-400",
  "bg-orange-500/80 border-orange-400",
  "bg-pink-500/80 border-pink-400",
  "bg-teal-500/80 border-teal-400",
];
const KEY_SETS: Record<string, { label: string; words: string[] }> = {
  all:   { label: "All Words", words: WORD_LIST },
  home:  { label: "Home Row",  words: LESSON_WORDS[1] },
  top:   { label: "Top Row",   words: LESSON_WORDS[2] },
  speed: { label: "Speed",     words: LESSON_WORDS[4] },
};

interface FallingWord {
  id: number;
  word: string;
  col: number;
  row: number; // float
  color: string;
  clearing: boolean;
}
interface StackedWord {
  id: number;
  word: string;
  row: number;
  col: number;
  color: string;
}

let wid = 1;

export default function WordTetris() {
  const [gameState, setGameState] = useState<"idle" | "playing" | "over">("idle");
  const [falling, setFalling] = useState<FallingWord | null>(null);
  const [stacked, setStacked] = useState<StackedWord[]>([]);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem(HS_KEY) || "0", 10));
  const [keySet, setKeySet] = useState<keyof typeof KEY_SETS>("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const fallingRef = useRef<FallingWord | null>(null);
  const stackedRef = useRef<StackedWord[]>([]);
  const scoreRef = useRef(0);
  const linesRef = useRef(0);
  const levelRef = useRef(1);
  const { playCorrect, playGameOver, playCombo } = useGameSounds();
  fallingRef.current = falling;
  stackedRef.current = stacked;
  scoreRef.current = score;
  linesRef.current = lines;
  levelRef.current = level;

  const spawnWord = useCallback(() => {
    const pool = KEY_SETS[keySet].words;
    const short = pool.filter(w => w.length <= 6);
    const word = short[Math.floor(Math.random() * short.length)];
    const col = Math.floor(Math.random() * Math.max(1, GRID_COLS - word.length));
    setFalling({ id: wid++, word, col, row: 0, color: WORD_COLORS[Math.floor(Math.random() * WORD_COLORS.length)], clearing: false });
  }, [keySet]);

  const endGame = useCallback(() => {
    setGameState("over");
    playGameOver();
    const fs = scoreRef.current;
    if (fs > parseInt(localStorage.getItem(HS_KEY) || "0", 10)) {
      localStorage.setItem(HS_KEY, fs.toString());
      setHighScore(fs);
    }
    addXP(calculateGameXP("word-tetris", fs));
    if (linesRef.current >= 20) awardGameBadge("tetris-master");
  }, [playGameOver]);

  // Count occupied rows for a given cell
  const isOccupied = useCallback((row: number, col: number, width: number) => {
    return stackedRef.current.some(s => {
      const stackRow = Math.round(s.row);
      if (stackRow !== row) return false;
      return !(col + width <= s.col || col >= s.col + s.word.length);
    });
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState !== "playing") return;
    const speed = 0.08 + levelRef.current * 0.04;
    const timer = setInterval(() => {
      setFalling(prev => {
        if (!prev || prev.clearing) return prev;
        const nextRow = prev.row + speed;
        const intRow = Math.floor(nextRow);
        // Check collision with stack or floor
        const floorHit = intRow + 1 >= GRID_ROWS;
        const stackHit = isOccupied(intRow + 1, prev.col, prev.word.length);
        if (floorHit || stackHit) {
          const landRow = Math.min(intRow, GRID_ROWS - 1);
          // Check if landed above top
          if (landRow <= 0) { endGame(); return prev; }
          setStacked(s => [...s, { id: prev.id, word: prev.word, row: landRow, col: prev.col, color: prev.color }]);
          setLines(l => l + 1);
          setLevel(lv => Math.floor((linesRef.current + 1) / 5) + 1);
          setTimeout(spawnWord, 200);
          return null;
        }
        return { ...prev, row: nextRow };
      });
    }, 80);
    return () => clearInterval(timer);
  }, [gameState, spawnWord, endGame, isOccupied]);

  const startGame = useCallback(() => {
    setFalling(null);
    setStacked([]);
    setInput("");
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameState("playing");
    setTimeout(spawnWord, 300);
    inputRef.current?.focus();
  }, [spawnWord]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    const typed = val.trim().toLowerCase();

    // Check falling word
    if (fallingRef.current && !fallingRef.current.clearing && fallingRef.current.word.toLowerCase() === typed) {
      playCorrect();
      setScore(s => s + fallingRef.current!.word.length * levelRef.current);
      setFalling(prev => prev ? { ...prev, clearing: true } : prev);
      setInput("");
      setTimeout(() => { setFalling(null); setTimeout(spawnWord, 300); }, 350);
      return;
    }
    // Check stacked words
    const matchIdx = stackedRef.current.findIndex(s => s.word.toLowerCase() === typed);
    if (matchIdx >= 0) {
      playCorrect();
      const match = stackedRef.current[matchIdx];
      playCombo(Math.floor(match.row / 3));
      setScore(s => s + match.word.length * (GRID_ROWS - match.row) * levelRef.current);
      setStacked(prev => prev.filter((_, i) => i !== matchIdx));
      setInput("");
    }
  };

  const cellSize = 46;

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link href="/games" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />Games
          </Link>
          {gameState === "playing" && (
            <div className="flex gap-4 text-sm">
              <span className="text-primary font-black">{score} pts</span>
              <span className="text-muted-foreground">Lines: {lines}</span>
              <span className="text-accent">Lv.{level}</span>
            </div>
          )}
        </div>

        <div className="text-center mb-5">
          <h1 className="text-3xl font-black mb-1">🟦 Word Tetris</h1>
          <p className="text-muted-foreground text-sm">Type the falling words before they stack up to the top!</p>
        </div>

        {gameState === "idle" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
            <div className="rounded-2xl bg-card border border-border/60 p-8 max-w-sm w-full text-center">
              <div className="text-6xl mb-4">🟦</div>
              <h2 className="text-xl font-black mb-2">Word Tetris</h2>
              <p className="text-muted-foreground text-sm mb-6">Words fall like Tetris blocks. Type them to clear — miss them and they stack up. Don't let the stack reach the top!</p>
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
              {highScore > 0 && <p className="text-xs text-yellow-400 mb-4"><Trophy className="w-3 h-3 inline mr-1" />Best: {highScore} pts</p>}
              <Button onClick={startGame} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold">Start Game</Button>
            </div>
          </motion.div>
        )}

        {gameState === "over" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center">
            <div className="rounded-2xl bg-card border border-border/60 p-8 max-w-sm w-full text-center">
              <div className="text-5xl mb-4">🟦</div>
              <h2 className="text-2xl font-black mb-2">Stack Overflow!</h2>
              <div className="text-5xl font-black text-primary mb-1">{score}</div>
              <div className="text-muted-foreground text-sm mb-2">points — {lines} lines</div>
              {score >= highScore && score > 0 && <p className="text-yellow-400 font-bold text-sm mb-4">🏆 New High Score!</p>}
              <div className="flex gap-3">
                <Button onClick={startGame} className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold gap-1.5">
                  <RefreshCw className="w-4 h-4" />Retry
                </Button>
                <Link href="/games"><Button variant="outline" className="flex-1 border-border/60">All Games</Button></Link>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === "playing" && (
          <div>
            {/* Grid */}
            <div className="relative mx-auto mb-5 rounded-xl overflow-hidden border border-border/60 bg-[hsl(220,47%,4%)]"
              style={{ width: GRID_COLS * cellSize, height: GRID_ROWS * cellSize }}>
              {/* Grid lines */}
              {Array.from({ length: GRID_ROWS }).map((_, r) =>
                <div key={r} className="absolute w-full border-b border-white/3" style={{ top: r * cellSize, height: cellSize }} />
              )}
              {Array.from({ length: GRID_COLS }).map((_, c) =>
                <div key={c} className="absolute border-r border-white/3 h-full" style={{ left: c * cellSize, width: cellSize }} />
              )}

              {/* Stacked words */}
              <AnimatePresence>
                {stacked.map(s => (
                  <motion.div key={s.id}
                    initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 0 }}
                    className={`absolute flex items-center justify-center rounded border ${s.color} px-1`}
                    style={{ left: s.col * cellSize, top: s.row * cellSize, width: s.word.length * cellSize, height: cellSize - 2 }}
                  >
                    <span className="text-white font-black text-xs">{s.word}</span>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Falling word */}
              <AnimatePresence>
                {falling && (
                  <motion.div
                    key={falling.id}
                    animate={{ scale: falling.clearing ? 1.3 : 1, opacity: falling.clearing ? 0 : 1 }}
                    transition={{ duration: 0.3 }}
                    className={`absolute flex items-center justify-center rounded border ${falling.color} px-1 shadow-lg`}
                    style={{ left: falling.col * cellSize, top: falling.row * cellSize, width: falling.word.length * cellSize, height: cellSize - 2 }}
                  >
                    <span className="text-white font-black text-sm">{falling.word}</span>
                    {/* Drop shadow indicator */}
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/20 rounded-full" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Danger zone overlay */}
              <div className="absolute top-0 left-0 right-0 h-10 bg-red-500/5 border-b border-red-500/20 pointer-events-none" />
              <div className="absolute top-1 left-1 text-[9px] text-red-400/60 font-bold">DANGER ZONE</div>
            </div>

            <input
              ref={inputRef}
              value={input}
              onChange={handleInput}
              className="w-full bg-card border border-border/60 focus:border-primary/60 rounded-2xl px-6 py-4 text-xl font-mono font-bold text-center outline-none transition-colors"
              placeholder="Type the falling word..."
              autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}

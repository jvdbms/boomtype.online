import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, RefreshCw, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WORD_LIST, LESSON_WORDS } from "@/lib/words";
import { useGameSounds } from "@/hooks/useGameSounds";
import { addXP, awardGameBadge, calculateGameXP } from "@/lib/storage";

const HS_KEY = "boomtype_piperun_hs";
const NUM_LANES = 4;
const LANE_COLORS = ["text-blue-400", "text-purple-400", "text-green-400", "text-orange-400"];
const LANE_BG = ["bg-blue-500/10 border-blue-500/30", "bg-purple-500/10 border-purple-500/30", "bg-green-500/10 border-green-500/30", "bg-orange-500/10 border-orange-500/30"];

const KEY_SETS: Record<string, { label: string; words: string[] }> = {
  all:   { label: "All Words", words: WORD_LIST },
  home:  { label: "Home Row",  words: LESSON_WORDS[1] },
  top:   { label: "Top Row",   words: LESSON_WORDS[2] },
  speed: { label: "Speed",     words: LESSON_WORDS[4] },
};

interface PipeWord { id: number; word: string; lane: number; progress: number; cleared: boolean; }
let nid = 1;

export default function PipeRun() {
  const [gameState, setGameState] = useState<"idle" | "playing" | "over">("idle");
  const [words, setWords] = useState<PipeWord[]>([]);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem(HS_KEY) || "0", 10));
  const [keySet, setKeySet] = useState<keyof typeof KEY_SETS>("all");
  const [flash, setFlash] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wordsRef = useRef<PipeWord[]>([]);
  const livesRef = useRef(3);
  const scoreRef = useRef(0);
  const levelRef = useRef(1);
  const { playCorrect, playGameOver } = useGameSounds();
  wordsRef.current = words;
  livesRef.current = lives;
  scoreRef.current = score;
  levelRef.current = level;

  const spawnWord = useCallback(() => {
    const pool = KEY_SETS[keySet].words;
    const usedLanes = new Set(wordsRef.current.filter(w => !w.cleared).map(w => w.lane));
    const available = Array.from({ length: NUM_LANES }, (_, i) => i).filter(l => !usedLanes.has(l));
    if (available.length === 0) return;
    const lane = available[Math.floor(Math.random() * available.length)];
    const word = pool[Math.floor(Math.random() * pool.length)];
    setWords(prev => [...prev, { id: nid++, word, lane, progress: 0, cleared: false }]);
  }, [keySet]);

  const endGame = useCallback(() => {
    setGameState("over");
    playGameOver();
    const fs = scoreRef.current;
    if (fs > parseInt(localStorage.getItem(HS_KEY) || "0", 10)) {
      localStorage.setItem(HS_KEY, fs.toString());
      setHighScore(fs);
    }
    addXP(calculateGameXP("pipe-run", fs));
    if (fs >= 30) awardGameBadge("pipe-cleaner");
  }, [playGameOver]);

  // Game loop
  useEffect(() => {
    if (gameState !== "playing") return;
    const spawnInterval = Math.max(2400 - levelRef.current * 100, 900);
    const spawnTimer = setInterval(spawnWord, spawnInterval);

    const speed = 0.3 + levelRef.current * 0.08;
    const moveTimer = setInterval(() => {
      setWords(prev => {
        const next: PipeWord[] = [];
        let missed = 0;
        for (const w of prev) {
          if (w.cleared) { next.push(w); continue; }
          const p = w.progress + speed;
          if (p >= 100) {
            missed++;
            setFlash(w.lane);
            setTimeout(() => setFlash(null), 300);
          } else {
            next.push({ ...w, progress: p });
          }
        }
        if (missed > 0) {
          setLives(l => {
            const nl = l - missed;
            if (nl <= 0) { endGame(); return 0; }
            return nl;
          });
        }
        return next;
      });
    }, 50);

    // Level up every 10 points
    const levelTimer = setInterval(() => {
      setLevel(l => {
        const newLevel = Math.floor(scoreRef.current / 10) + 1;
        return newLevel > l ? newLevel : l;
      });
    }, 2000);

    spawnWord();

    return () => { clearInterval(spawnTimer); clearInterval(moveTimer); clearInterval(levelTimer); };
  }, [gameState, spawnWord, endGame]);

  const startGame = useCallback(() => {
    setWords([]);
    setInput("");
    setScore(0);
    setLives(3);
    setLevel(1);
    setGameState("playing");
    inputRef.current?.focus();
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    const typed = val.trim().toLowerCase();
    const match = wordsRef.current.find(w => !w.cleared && w.word.toLowerCase() === typed);
    if (match) {
      playCorrect();
      setWords(prev => prev.map(w => w.id === match.id ? { ...w, cleared: true } : w));
      setTimeout(() => setWords(prev => prev.filter(w => w.id !== match.id)), 350);
      setScore(prev => prev + 1);
      setInput("");
    }
  };

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link href="/games" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />Games
          </Link>
          {gameState === "playing" && (
            <div className="flex items-center gap-4">
              <div className="flex gap-1">{Array.from({ length: 3 }).map((_, i) => (
                <Heart key={i} className={`w-5 h-5 ${i < lives ? "text-red-400 fill-red-400" : "text-border"}`} />
              ))}</div>
              <div className="text-sm font-bold text-primary">{score} cleared</div>
              <div className="text-xs text-muted-foreground">Lv.{level}</div>
            </div>
          )}
        </div>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-black mb-1">🔧 Pipe Run</h1>
          <p className="text-muted-foreground text-sm">Type words to clear them from the pipes before they escape!</p>
        </div>

        {gameState === "idle" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
            <div className="rounded-2xl bg-card border border-border/60 p-8 max-w-sm w-full text-center">
              <div className="text-6xl mb-4">🔧</div>
              <h2 className="text-xl font-black mb-2">Pipe Run</h2>
              <p className="text-muted-foreground text-sm mb-6">Words flow through pipes. Type each word before it escapes the right side!</p>
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
              {highScore > 0 && <p className="text-xs text-yellow-400 mb-4"><Trophy className="w-3 h-3 inline mr-1" />Best: {highScore} cleared</p>}
              <Button onClick={startGame} className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold">Start Game</Button>
            </div>
          </motion.div>
        )}

        {gameState === "over" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center">
            <div className="rounded-2xl bg-card border border-border/60 p-8 max-w-sm w-full text-center">
              <div className="text-5xl mb-4">💥</div>
              <h2 className="text-2xl font-black mb-2">Pipe Burst!</h2>
              <div className="text-5xl font-black text-primary mb-1">{score}</div>
              <div className="text-muted-foreground text-sm mb-2">words cleared</div>
              {score >= highScore && score > 0 && <p className="text-yellow-400 font-bold text-sm mb-4">🏆 New High Score!</p>}
              <div className="flex gap-3">
                <Button onClick={startGame} className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold gap-1.5">
                  <RefreshCw className="w-4 h-4" />Retry
                </Button>
                <Link href="/games"><Button variant="outline" className="flex-1 border-border/60">All Games</Button></Link>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === "playing" && (
          <div>
            {/* Pipe lanes */}
            <div className="space-y-3 mb-5">
              {Array.from({ length: NUM_LANES }).map((_, lane) => {
                const laneWord = words.find(w => w.lane === lane && !w.cleared);
                const isFlashing = flash === lane;
                return (
                  <div key={lane} className={`relative h-16 rounded-2xl border ${LANE_BG[lane]} overflow-hidden flex items-center transition-all ${isFlashing ? "border-red-400 shadow-[0_0_12px_rgba(248,113,113,0.4)]" : ""}`}>
                    {/* Pipe grooves */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 40px, white 40px, white 41px)" }} />
                    {/* Flow direction arrow */}
                    <div className="absolute right-3 text-xs text-white/20 font-bold">→→→</div>
                    <AnimatePresence>
                      {laneWord && (
                        <motion.div
                          key={laneWord.id}
                          className={`absolute flex items-center`}
                          style={{ left: `${laneWord.progress}%`, transform: "translateX(-50%)" }}
                        >
                          <div className={`px-3 py-1.5 rounded-xl bg-card border ${LANE_BG[lane].split(" ")[1]} shadow-lg`}>
                            <span className={`font-black text-sm ${LANE_COLORS[lane]}`}>{laneWord.word}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {/* Lane label */}
                    <div className={`absolute left-3 text-[10px] font-bold opacity-40 ${LANE_COLORS[lane]}`}>PIPE {lane + 1}</div>
                  </div>
                );
              })}
            </div>

            <input
              ref={inputRef}
              value={input}
              onChange={handleInput}
              className="w-full bg-card border border-border/60 focus:border-primary/60 rounded-2xl px-6 py-4 text-xl font-mono font-bold text-center outline-none transition-colors"
              placeholder="Type the word to clear the pipe..."
              autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}

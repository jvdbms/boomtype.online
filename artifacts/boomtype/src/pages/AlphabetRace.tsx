import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, RefreshCw, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameSounds } from "@/hooks/useGameSounds";
import { addXP, awardGameBadge, calculateGameXP } from "@/lib/storage";

const HS_KEY = "boomtype_alphabetrace_hs";
const MODES = [
  { id: "az",      label: "A → Z",     sequence: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("") },
  { id: "za",      label: "Z → A",     sequence: "ZYXWVUTSRQPONMLKJIHGFEDCBA".split("") },
  { id: "nums",    label: "0 → 9",     sequence: "0123456789".split("") },
  { id: "vowels",  label: "Vowels",    sequence: "AEIOUAEIOUAEIOU".split("") },
  { id: "home",    label: "Home Row",  sequence: "ASDFGHJKL".split("") },
];

interface Attempt { time: number; mode: string; }

export default function AlphabetRace() {
  const [gameState, setGameState] = useState<"idle" | "ready" | "playing" | "done">("idle");
  const [mode, setMode] = useState(MODES[0]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [bestTimes, setBestTimes] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem(HS_KEY) || "{}"); } catch { return {}; }
  });
  const [lastTime, setLastTime] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [correctFlash, setCorrectFlash] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const startRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { playCorrect, playGameOver } = useGameSounds();

  const saveBest = useCallback((t: number, modeId: string) => {
    setBestTimes(prev => {
      const cur = prev[modeId];
      if (!cur || t < cur) {
        const next = { ...prev, [modeId]: t };
        localStorage.setItem(HS_KEY, JSON.stringify(next));
        return next;
      }
      return prev;
    });
  }, []);

  const startGame = useCallback(() => {
    setCurrentIdx(0);
    setElapsed(0);
    setLastTime(0);
    setMistakes(0);
    setIsNewBest(false);
    setGameState("ready");
    setTimeout(() => {
      setGameState("playing");
      startRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startRef.current) / 10) / 100);
      }, 50);
    }, 800);
  }, [mode]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (gameState !== "playing") return;
    const key = e.key.toUpperCase();
    const expected = mode.sequence[currentIdx];
    if (key === expected) {
      playCorrect();
      setCorrectFlash(true);
      setTimeout(() => setCorrectFlash(false), 120);
      if (currentIdx + 1 >= mode.sequence.length) {
        // Done!
        if (timerRef.current) clearInterval(timerRef.current);
        const t = Math.floor((Date.now() - startRef.current) / 10) / 100;
        setLastTime(t);
        setElapsed(t);
        const cur = bestTimes[mode.id];
        const newBest = !cur || t < cur;
        setIsNewBest(newBest);
        if (newBest) saveBest(t, mode.id);
        setGameState("done");
        playGameOver();
        addXP(calculateGameXP("alphabet-race", 1));
        if (mode.id === "az" && t < 8) awardGameBadge("alphabet-ace");
      } else {
        setCurrentIdx(prev => prev + 1);
      }
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      setWrongFlash(true);
      setMistakes(prev => prev + 1);
      setTimeout(() => setWrongFlash(false), 150);
    }
  }, [gameState, currentIdx, mode, bestTimes, playCorrect, playGameOver, saveBest]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    document.title = "Alphabet Race | BoomType Games";
  }, []);

  const progress = gameState === "playing" || gameState === "done"
    ? (currentIdx / mode.sequence.length) * 100
    : 0;

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link href="/games" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />Games
          </Link>
          {gameState === "playing" && (
            <div className="flex items-center gap-3">
              <Timer className="w-4 h-4 text-primary" />
              <span className="text-2xl font-black tabular-nums text-primary">{elapsed.toFixed(2)}s</span>
            </div>
          )}
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-1">⚡ Alphabet Race</h1>
          <p className="text-muted-foreground text-sm">Type the sequence as fast as possible — race your personal best!</p>
        </div>

        {(gameState === "idle" || gameState === "done") && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Mode selector */}
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {MODES.map(m => (
                <button key={m.id} onClick={() => setMode(m)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${mode.id === m.id ? "bg-primary/15 border-primary/40 text-primary" : "bg-card border-border/40 text-muted-foreground hover:text-foreground"}`}
                >
                  {m.label}
                  {bestTimes[m.id] && (
                    <span className="ml-2 text-yellow-400 text-xs">{bestTimes[m.id].toFixed(2)}s</span>
                  )}
                </button>
              ))}
            </div>

            {gameState === "done" && (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="rounded-2xl bg-card border border-border/60 p-8 text-center mb-6"
              >
                <div className="text-5xl mb-3">{isNewBest ? "🏆" : "✅"}</div>
                <h2 className="text-2xl font-black mb-1">{isNewBest ? "New Best!" : "Done!"}</h2>
                <div className="text-6xl font-black text-primary my-4 tabular-nums">{lastTime.toFixed(2)}s</div>
                {bestTimes[mode.id] && !isNewBest && (
                  <p className="text-muted-foreground text-sm mb-1">Best: <span className="text-yellow-400 font-bold">{bestTimes[mode.id].toFixed(2)}s</span></p>
                )}
                <p className="text-muted-foreground text-sm mb-2">Mistakes: {mistakes}</p>
                <p className="text-yellow-400 font-bold mb-1 text-sm flex items-center justify-center gap-1">
                  ⚡ +{calculateGameXP("alphabet-race", 1)} XP earned
                </p>
                {mode.id === "az" && lastTime < 8 && (
                  <p className="text-yellow-400 font-bold text-sm">🔤 Alphabet Ace badge unlocked!</p>
                )}
              </motion.div>
            )}

            {/* Sequence preview */}
            <div className="rounded-2xl bg-card border border-border/60 p-6 mb-6 text-center">
              <p className="text-xs text-muted-foreground mb-3 font-bold uppercase tracking-wide">Sequence to type</p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {mode.sequence.map((char, i) => (
                  <span key={i} className="w-9 h-9 rounded-lg bg-white/5 border border-border/60 flex items-center justify-center font-black text-sm">
                    {char}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={startGame} className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-black text-base py-5 h-auto gap-2 hover:opacity-90">
                {gameState === "done" ? <><RefreshCw className="w-5 h-5" />Race Again</> : <><Timer className="w-5 h-5" />Start Race</>}
              </Button>
              <Link href="/games"><Button variant="outline" className="flex-1 border-border/60 h-auto py-5">All Games</Button></Link>
            </div>
          </motion.div>
        )}

        {gameState === "ready" && (
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center py-20">
            <div className="text-8xl font-black text-primary animate-pulse">GET READY</div>
          </motion.div>
        )}

        {gameState === "playing" && (
          <div>
            {/* Progress bar */}
            <div className="h-2 bg-border/30 rounded-full mb-8 overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full" style={{ width: `${progress}%` }} />
            </div>

            {/* Current + next keys */}
            <div className="flex items-center justify-center gap-6 mb-8">
              {currentIdx > 0 && (
                <div className="w-16 h-16 rounded-xl bg-green-500/15 border border-green-500/30 flex items-center justify-center text-3xl font-black text-green-400 opacity-50">
                  {mode.sequence[currentIdx - 1]}
                </div>
              )}
              <motion.div
                key={currentIdx}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`w-28 h-28 rounded-3xl flex items-center justify-center text-6xl font-black border-4 transition-all duration-100 ${
                  correctFlash ? "bg-green-500 border-green-400 text-white scale-110" :
                  wrongFlash ? "bg-red-500/40 border-red-400 text-red-200" :
                  "bg-primary/15 border-primary text-primary shadow-[0_0_30px_rgba(99,102,241,0.3)]"
                }`}
              >
                {mode.sequence[currentIdx]}
              </motion.div>
              {currentIdx < mode.sequence.length - 1 && (
                <div className="w-16 h-16 rounded-xl bg-white/5 border border-border/40 flex items-center justify-center text-3xl font-black text-muted-foreground/40">
                  {mode.sequence[currentIdx + 1]}
                </div>
              )}
            </div>

            {/* All characters with progress */}
            <div className="flex flex-wrap gap-1 justify-center mb-4">
              {mode.sequence.map((char, i) => (
                <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black transition-all border ${
                  i < currentIdx ? "bg-green-500/20 text-green-400 border-green-500/30" :
                  i === currentIdx ? "bg-primary/20 text-primary border-primary/50 shadow-[0_0_10px_rgba(99,102,241,0.3)]" :
                  "bg-white/3 text-muted-foreground/40 border-border/20"
                }`}>
                  {char}
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground">{currentIdx}/{mode.sequence.length} — Mistakes: {mistakes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

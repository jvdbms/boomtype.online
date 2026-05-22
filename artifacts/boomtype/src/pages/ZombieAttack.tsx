import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RefreshCw, Sword, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WORD_LIST } from "@/lib/words";

interface Zombie {
  id: number;
  word: string;
  x: number;
  y: number;
  speed: number;
  hp: number;
  typed: string;
  dead: boolean;
}

let zombieId = 0;

export default function ZombieAttack() {
  const [zombies, setZombies] = useState<Zombie[]>([]);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [wave, setWave] = useState(1);
  const [gameState, setGameState] = useState<"idle" | "playing" | "over">("idle");
  const [killedIds, setKilledIds] = useState<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const animRef = useRef<number>(0);
  const zombiesRef = useRef<Zombie[]>([]);
  const gameStateRef = useRef<"idle" | "playing" | "over">("idle");
  const waveRef = useRef(1);
  const lastSpawnRef = useRef(0);
  const playerHpRef = useRef(100);

  zombiesRef.current = zombies;

  useEffect(() => {
    document.title = "Zombie Attack | BoomType Games";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Play Zombie Attack on BoomType — type zombie word labels to destroy them before they reach your base. Typing survival game with wave system.");
  }, []);

  const spawnZombie = useCallback(() => {
    const word = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    const z: Zombie = {
      id: ++zombieId,
      word,
      x: 5 + Math.random() * 70,
      y: 0,
      speed: 0.05 + waveRef.current * 0.012,
      hp: 100,
      typed: "",
      dead: false,
    };
    setZombies(prev => [...prev, z]);
  }, []);

  const gameLoop = useCallback((ts: number) => {
    if (gameStateRef.current !== "playing") return;

    const spawnInterval = Math.max(1500, 3000 - waveRef.current * 200);
    if (ts - lastSpawnRef.current > spawnInterval) {
      spawnZombie();
      lastSpawnRef.current = ts;
    }

    setZombies(prev => {
      const updated = prev.map(z => z.dead ? z : { ...z, y: z.y + z.speed });
      const reached = updated.filter(z => !z.dead && z.y >= 78);
      if (reached.length > 0) {
        const damage = reached.length * 25;
        const newHp = Math.max(0, playerHpRef.current - damage);
        playerHpRef.current = newHp;
        setPlayerHp(newHp);
        if (newHp <= 0) {
          setGameState("over");
          gameStateRef.current = "over";
        }
        return updated.filter(z => !(!z.dead && z.y >= 78));
      }
      return updated;
    });

    animRef.current = requestAnimationFrame(gameLoop);
  }, [spawnZombie]);

  const startGame = useCallback(() => {
    zombieId = 0;
    lastSpawnRef.current = 0;
    setZombies([]);
    setInput("");
    setScore(0);
    setPlayerHp(100);
    playerHpRef.current = 100;
    setWave(1);
    waveRef.current = 1;
    setKilledIds([]);
    setGameState("playing");
    gameStateRef.current = "playing";
    animRef.current = requestAnimationFrame(gameLoop);
    inputRef.current?.focus();
  }, [gameLoop]);

  useEffect(() => {
    if (gameState === "over") cancelAnimationFrame(animRef.current);
  }, [gameState]);

  useEffect(() => {
    if (score > 0 && score % 8 === 0) {
      setWave(w => { const nw = w + 1; waveRef.current = nw; return nw; });
    }
  }, [score]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);

    setZombies(prev => {
      const sorted = [...prev].filter(z => !z.dead).sort((a, b) => b.y - a.y);
      for (const z of sorted) {
        if (z.word.startsWith(val.trim()) && val.trim().length > 0) {
          if (z.word === val.trim()) {
            setKilledIds(k => [...k, z.id]);
            setScore(s => s + 1);
            setTimeout(() => {
              setZombies(p => p.filter(zz => zz.id !== z.id));
              setKilledIds(k => k.filter(id => id !== z.id));
            }, 400);
            setInput("");
            return prev.map(zz => zz.id === z.id ? { ...zz, dead: true, typed: val.trim() } : zz);
          } else {
            return prev.map(zz => zz.id === z.id ? { ...zz, typed: val.trim() } : { ...zz, typed: zz.id !== z.id ? "" : zz.typed });
          }
        }
      }
      return prev.map(z => ({ ...z, typed: "" }));
    });
  }, []);

  return (
    <div className="min-h-screen py-4 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/games" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Sword className="w-6 h-6 text-red-400" />
            Zombie Attack
          </h1>
          <div className="ml-auto flex items-center gap-4 text-sm">
            <span className="font-bold text-primary">Kills: {score}</span>
            <span className="font-bold text-orange-400">Wave {wave}</span>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center gap-1 text-muted-foreground"><Shield className="w-3 h-3" /> Player HP</span>
            <span className={`font-bold ${playerHp > 50 ? "text-green-400" : playerHp > 25 ? "text-yellow-400" : "text-red-400"}`}>{playerHp}%</span>
          </div>
          <div className="h-2 bg-card border border-border/60 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full transition-all ${playerHp > 50 ? "bg-green-500" : playerHp > 25 ? "bg-yellow-500" : "bg-red-500"}`}
              style={{ width: `${playerHp}%` }}
            />
          </div>
        </div>

        <div className="relative rounded-2xl bg-card border border-red-500/20 overflow-hidden" style={{ height: "380px" }}>
          {gameState === "idle" && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm z-20">
              <div className="text-center">
                <div className="text-5xl mb-4">🧟</div>
                <h2 className="text-2xl font-black mb-2">Zombie Attack</h2>
                <p className="text-muted-foreground mb-6 max-w-xs">Zombies march toward you. Type their word labels to destroy them before they reach your base!</p>
                <Button onClick={startGame} className="bg-red-600 hover:bg-red-700 text-white font-bold px-8">
                  Survive!
                </Button>
              </div>
            </div>
          )}
          {gameState === "over" && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/90 backdrop-blur-sm z-20">
              <div className="text-center">
                <div className="text-5xl mb-4">💀</div>
                <h2 className="text-2xl font-black mb-1">You Survived Until Wave {wave}</h2>
                <p className="text-4xl font-black text-red-400 mb-6">{score} kills</p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={startGame} className="bg-red-600 hover:bg-red-700 text-white font-bold gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </Button>
                  <Link href="/games"><Button variant="outline" className="border-border/60">Games Hub</Button></Link>
                </div>
              </div>
            </div>
          )}

          <AnimatePresence>
            {zombies.map(z => (
              <motion.div
                key={z.id}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.4, y: -20 }}
                className="absolute flex flex-col items-center"
                style={{ left: `${z.x}%`, top: `${z.y}%`, transform: "translateX(-50%)" }}
              >
                <div className="text-2xl mb-0.5">{z.dead ? "💥" : "🧟"}</div>
                <div className={`px-2 py-0.5 rounded-full text-xs font-bold font-mono border ${
                  killedIds.includes(z.id)
                    ? "bg-green-500/20 border-green-500/40 text-green-300"
                    : z.typed.length > 0
                    ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-300"
                    : "bg-red-500/10 border-red-500/30 text-red-300"
                }`}>
                  {z.typed.length > 0 ? (
                    <>
                      <span className="text-green-400">{z.word.slice(0, z.typed.length)}</span>
                      <span>{z.word.slice(z.typed.length)}</span>
                    </>
                  ) : z.word}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-red-500/10 to-transparent flex items-center justify-center">
            <div className="text-xs text-red-400/60 font-medium">⚔️ Defense Line</div>
          </div>
        </div>

        {gameState === "playing" && (
          <div className="mt-4">
            <input
              ref={inputRef}
              value={input}
              onChange={handleInput}
              className="w-full px-5 py-3 rounded-xl bg-card border border-red-500/30 text-foreground font-mono text-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              placeholder="Type the zombie's word to destroy it..."
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}

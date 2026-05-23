import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RefreshCw, Sword, Shield, Trophy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WORD_LIST } from "@/lib/words";
import { useGameSounds } from "@/hooks/useGameSounds";
import { getNickname, setNickname, addGameXP, awardGameBadge, calculateGameXP } from "@/lib/storage";
import { useSubmitGameScore } from "@workspace/api-client-react";

const HIGH_SCORE_KEY = "boomtype_zombie_hs";

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

interface FloatingPop {
  id: number;
  x: number;
  y: number;
  text: string;
}

let zombieId = 0;
let popId = 0;

export default function ZombieAttack() {
  const [zombies, setZombies] = useState<Zombie[]>([]);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [wave, setWave] = useState(1);
  const [gameState, setGameState] = useState<"idle" | "playing" | "over">("idle");
  const [killedIds, setKilledIds] = useState<number[]>([]);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem(HIGH_SCORE_KEY) || "0", 10));
  const [newHighScore, setNewHighScore] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [floatingPops, setFloatingPops] = useState<FloatingPop[]>([]);
  const [damageFlash, setDamageFlash] = useState(false);
  const [waveBanner, setWaveBanner] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const animRef = useRef<number>(0);
  const zombiesRef = useRef<Zombie[]>([]);
  const gameStateRef = useRef<"idle" | "playing" | "over">("idle");
  const waveRef = useRef(1);
  const lastSpawnRef = useRef(0);
  const playerHpRef = useRef(100);
  const scoreRef = useRef(0);
  const finalScoreRef = useRef(0);
  const { playCorrect, playGameOver } = useGameSounds();
  const { mutate: submitScore } = useSubmitGameScore({
    mutation: { onSuccess: () => setScoreSubmitted(true) },
  });

  zombiesRef.current = zombies;

  useEffect(() => {
    document.title = "Zombie Attack | BoomType Games";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Play Zombie Attack on BoomType — type zombie word labels to destroy them before they reach your base. Typing survival game with wave system.");
  }, []);

  const addFloatingPop = useCallback((x: number, y: number, text: string) => {
    const id = ++popId;
    setFloatingPops(prev => [...prev, { id, x, y, text }]);
    setTimeout(() => setFloatingPops(prev => prev.filter(p => p.id !== id)), 900);
  }, []);

  const triggerDamageFlash = useCallback(() => {
    setDamageFlash(true);
    setTimeout(() => setDamageFlash(false), 400);
  }, []);

  const submitToLeaderboard = useCallback((finalScore: number, nick: string) => {
    if (!nick.trim() || finalScore <= 0) return;
    setNickname(nick.trim());
    submitScore({ data: { nickname: nick.trim(), game: "zombie-attack", score: finalScore } });
  }, [submitScore]);

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
        triggerDamageFlash();
        if (newHp <= 0) {
          setGameState("over");
          gameStateRef.current = "over";
          playGameOver();
          const fs = scoreRef.current;
          finalScoreRef.current = fs;
          const prevBest = parseInt(localStorage.getItem(HIGH_SCORE_KEY) || "0", 10);
          if (fs > prevBest) {
            localStorage.setItem(HIGH_SCORE_KEY, fs.toString());
            setHighScore(fs);
            setNewHighScore(true);
          }
          addGameXP(calculateGameXP("zombie-attack", fs));
          if (fs >= 50) awardGameBadge("zombie-slayer");
          const storedNick = getNickname();
          if (storedNick) {
            setNicknameInput(storedNick);
            setTimeout(() => submitToLeaderboard(fs, storedNick), 0);
          }
        }
        return updated.filter(z => !(!z.dead && z.y >= 78));
      }
      return updated;
    });

    animRef.current = requestAnimationFrame(gameLoop);
  }, [spawnZombie, playGameOver, submitToLeaderboard, triggerDamageFlash]);

  const startGame = useCallback(() => {
    zombieId = 0;
    lastSpawnRef.current = 0;
    setZombies([]);
    setInput("");
    setScore(0);
    scoreRef.current = 0;
    setPlayerHp(100);
    playerHpRef.current = 100;
    setWave(1);
    waveRef.current = 1;
    setKilledIds([]);
    setNewHighScore(false);
    setScoreSubmitted(false);
    setNicknameInput(getNickname());
    setFloatingPops([]);
    setDamageFlash(false);
    setWaveBanner(null);
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
      const nextWave = Math.floor(score / 8) + 1;
      setWave(w => { const nw = w + 1; waveRef.current = nw; return nw; });
      setWaveBanner(nextWave);
      setTimeout(() => setWaveBanner(null), 1800);
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
            playCorrect();
            addFloatingPop(z.x, Math.max(5, z.y - 8), "+1");
            setKilledIds(k => [...k, z.id]);
            setScore(s => { const ns = s + 1; scoreRef.current = ns; return ns; });
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
  }, [playCorrect, addFloatingPop]);

  const handleManualSubmit = useCallback(() => {
    submitToLeaderboard(finalScoreRef.current, nicknameInput);
  }, [submitToLeaderboard, nicknameInput]);

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
          {damageFlash && (
            <div className="absolute inset-0 bg-red-500/30 z-10 pointer-events-none rounded-2xl" />
          )}

          <AnimatePresence>
            {waveBanner !== null && (
              <motion.div
                key={`wave-${waveBanner}`}
                initial={{ opacity: 0, scale: 0.7, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1, y: -10 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
              >
                <div className="bg-red-600/90 text-white font-black text-2xl px-8 py-3 rounded-2xl shadow-lg shadow-red-500/40">
                  🧟 Wave {waveBanner}!
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {floatingPops.map(pop => (
              <motion.div
                key={pop.id}
                initial={{ opacity: 1, y: 0, scale: 1 }}
                animate={{ opacity: 0, y: -50, scale: 1.3 }}
                transition={{ duration: 0.85, ease: "easeOut" }}
                className="absolute pointer-events-none font-black text-green-400 text-base drop-shadow-lg z-20"
                style={{
                  left: `${pop.x}%`,
                  top: `${pop.y}%`,
                  transform: "translateX(-50%)",
                }}
              >
                {pop.text}
              </motion.div>
            ))}
          </AnimatePresence>

          {gameState === "idle" && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm z-20">
              <div className="text-center">
                <div className="text-5xl mb-4">🧟</div>
                <h2 className="text-2xl font-black mb-2">Zombie Attack</h2>
                <p className="text-muted-foreground mb-4 max-w-xs">Zombies march toward you. Type their word labels to destroy them before they reach your base!</p>
                {highScore > 0 && (
                  <p className="text-red-400 font-bold mb-4 flex items-center justify-center gap-1">
                    <Trophy className="w-4 h-4" />Best: {highScore} kills
                  </p>
                )}
                <Button onClick={startGame} className="bg-red-600 hover:bg-red-700 text-white font-bold px-8">
                  Survive!
                </Button>
              </div>
            </div>
          )}
          {gameState === "over" && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/90 backdrop-blur-sm z-20">
              <div className="text-center px-6">
                <div className="text-5xl mb-4">💀</div>
                <h2 className="text-2xl font-black mb-1">You Survived Until Wave {wave}</h2>
                <p className="text-4xl font-black text-red-400 mb-1">{finalScoreRef.current} kills</p>
                {finalScoreRef.current > 0 && (
                  <p className="text-yellow-400 font-bold mb-1 text-sm flex items-center justify-center gap-1">
                    ⚡ +{calculateGameXP("zombie-attack", finalScoreRef.current)} XP earned
                  </p>
                )}
                {finalScoreRef.current >= 50 && (
                  <p className="text-red-400 font-bold mb-1 text-sm">🧟 Zombie Slayer badge unlocked!</p>
                )}
                {newHighScore && finalScoreRef.current > 0 && (
                  <p className="text-yellow-400 font-bold mb-2 text-sm">🏆 New High Score!</p>
                )}
                {!newHighScore && highScore > 0 && (
                  <p className="text-muted-foreground mb-2 text-sm">Best: {highScore} kills</p>
                )}
                {scoreSubmitted ? (
                  <p className="text-green-400 text-sm font-semibold mb-3 flex items-center justify-center gap-1">
                    <Check className="w-4 h-4" /> Score saved to leaderboard
                  </p>
                ) : (
                  <div className="flex gap-2 mb-3 mt-2">
                    <input
                      value={nicknameInput}
                      onChange={e => setNicknameInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleManualSubmit()}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-card border border-red-500/30 text-foreground text-sm focus:outline-none focus:border-red-500 min-w-0"
                      placeholder="Your nickname"
                      maxLength={20}
                    />
                    <Button
                      onClick={handleManualSubmit}
                      disabled={!nicknameInput.trim()}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white shrink-0"
                    >
                      Submit
                    </Button>
                  </div>
                )}
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

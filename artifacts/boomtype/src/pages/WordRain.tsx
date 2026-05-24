import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RefreshCw, CloudRain, Trophy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WORD_LIST } from "@/lib/words";
import { useGameSounds } from "@/hooks/useGameSounds";
import { getNickname, setNickname, addGameXP, awardGameBadge, calculateGameXP } from "@/lib/storage";
import XpRewardLine from "@/components/XpRewardLine";
import BadgeUnlockLine from "@/components/BadgeUnlockLine";
import { useSubmitGameScore } from "@workspace/api-client-react";

const HIGH_SCORE_KEY = "boomtype_wordrain_hs";

interface FallingWord {
  id: number;
  word: string;
  x: number;
  y: number;
  speed: number;
  matched: boolean;
}

interface FloatingPop {
  id: number;
  x: number;
  y: number;
  text: string;
}

let wordId = 0;
let popId = 0;

export default function WordRain() {
  const [words, setWords] = useState<FallingWord[]>([]);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [badgeJustUnlocked, setBadgeJustUnlocked] = useState(false);
  const [wave, setWave] = useState(1);
  const [gameState, setGameState] = useState<"idle" | "playing" | "over">("idle");
  const [destroyed, setDestroyed] = useState<number[]>([]);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem(HIGH_SCORE_KEY) || "0", 10));
  const [newHighScore, setNewHighScore] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [floatingPops, setFloatingPops] = useState<FloatingPop[]>([]);
  const [damageFlash, setDamageFlash] = useState(false);
  const [waveBanner, setWaveBanner] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const animRef = useRef<number>(0);
  const wordsRef = useRef<FallingWord[]>([]);
  const lastSpawnRef = useRef<number>(0);
  const gameStateRef = useRef<"idle" | "playing" | "over">("idle");
  const waveRef = useRef(1);
  const livesRef = useRef(3);
  const scoreRef = useRef(0);
  const finalScoreRef = useRef(0);
  const { playCorrect, playGameOver } = useGameSounds();
  const { mutate: submitScore } = useSubmitGameScore({
    mutation: { onSuccess: () => setScoreSubmitted(true) },
  });

  wordsRef.current = words;
  gameStateRef.current = gameState;
  waveRef.current = wave;
  livesRef.current = lives;
  scoreRef.current = score;

  useEffect(() => {
    document.title = "Word Rain | BoomType Games";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Play Word Rain on BoomType — type falling words before they hit the ground. Fun typing game that improves speed and reaction time.");
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
    submitScore({ data: { nickname: nick.trim(), game: "word-rain", score: finalScore } });
  }, [submitScore]);

  const spawnWord = useCallback(() => {
    const word = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    const newWord: FallingWord = {
      id: ++wordId,
      word,
      x: 5 + Math.random() * 80,
      y: 0,
      speed: 0.08 + waveRef.current * 0.015 + Math.random() * 0.02,
      matched: false,
    };
    setWords(prev => [...prev, newWord]);
  }, []);

  const gameLoop = useCallback((ts: number) => {
    if (gameStateRef.current !== "playing") return;

    const spawnInterval = Math.max(1200, 2200 - waveRef.current * 150);
    if (ts - lastSpawnRef.current > spawnInterval) {
      spawnWord();
      lastSpawnRef.current = ts;
    }

    setWords(prev => {
      const updated = prev.map(w => ({ ...w, y: w.y + w.speed }));
      const passed = updated.filter(w => w.y >= 92 && !w.matched);
      if (passed.length > 0 && livesRef.current > 0) {
        const newLives = Math.max(0, livesRef.current - passed.length);
        livesRef.current = newLives;
        triggerDamageFlash();
        if (newLives <= 0) {
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
          addGameXP(calculateGameXP("word-rain", fs));
          setBadgeJustUnlocked(fs >= 30 && awardGameBadge("word-warden"));
          const storedNick = getNickname();
          if (storedNick) {
            setNicknameInput(storedNick);
            setTimeout(() => submitToLeaderboard(fs, storedNick), 0);
          }
        } else {
          setLives(newLives);
        }
      }
      return updated.filter(w => w.y < 92 || w.matched);
    });

    animRef.current = requestAnimationFrame(gameLoop);
  }, [spawnWord, playGameOver, submitToLeaderboard, triggerDamageFlash]);

  const startGame = useCallback(() => {
    wordId = 0;
    lastSpawnRef.current = 0;
    setWords([]);
    setInput("");
    setScore(0);
    scoreRef.current = 0;
    setLives(3);
    setWave(1);
    setDestroyed([]);
    setNewHighScore(false);
    setScoreSubmitted(false);
    setNicknameInput(getNickname());
    setFloatingPops([]);
    setDamageFlash(false);
    setWaveBanner(null);
    setGameState("playing");
    gameStateRef.current = "playing";
    livesRef.current = 3;
    waveRef.current = 1;
    animRef.current = requestAnimationFrame(gameLoop);
    inputRef.current?.focus();
  }, [gameLoop]);

  useEffect(() => {
    if (gameState === "over") cancelAnimationFrame(animRef.current);
  }, [gameState]);

  useEffect(() => {
    if (score > 0 && score % 5 === 0) {
      const nextWave = Math.floor(score / 5) + 1;
      setWave(w => { const nw = w + 1; waveRef.current = nw; return nw; });
      setWaveBanner(nextWave);
      setTimeout(() => setWaveBanner(null), 1800);
    }
  }, [score]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);

    const match = wordsRef.current.find(w => !w.matched && w.word === val.trim());
    if (match) {
      playCorrect();
      addFloatingPop(match.x, Math.max(5, match.y - 5), "+1");
      setWords(prev => prev.map(w => w.id === match.id ? { ...w, matched: true } : w));
      setDestroyed(prev => [...prev, match.id]);
      setScore(s => { const ns = s + 1; scoreRef.current = ns; return ns; });
      setInput("");
      setTimeout(() => {
        setWords(prev => prev.filter(w => w.id !== match.id));
        setDestroyed(prev => prev.filter(id => id !== match.id));
      }, 300);
    }
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
            <CloudRain className="w-6 h-6 text-blue-400" />
            Word Rain
          </h1>
          <div className="ml-auto flex items-center gap-4 text-sm">
            <span className="font-bold text-primary">Score: {score}</span>
            <span className="font-bold text-orange-400">Wave {wave}</span>
            <span className="font-bold">{Array.from({ length: 3 }, (_, i) => i < lives ? "❤️" : "🖤").join("")}</span>
          </div>
        </div>

        <div className="relative rounded-2xl bg-card border border-blue-500/20 overflow-hidden" style={{ height: "420px" }}>
          {damageFlash && (
            <div className="absolute inset-0 bg-red-500/25 z-10 pointer-events-none rounded-2xl" />
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
                <div className="bg-orange-500/90 text-white font-black text-2xl px-8 py-3 rounded-2xl shadow-lg shadow-orange-500/40">
                  🌊 Wave {waveBanner}!
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
                <div className="text-5xl mb-4">🌧️</div>
                <h2 className="text-2xl font-black mb-2">Word Rain</h2>
                <p className="text-muted-foreground mb-4 max-w-xs">Words fall from the sky. Type them before they hit the ground. Miss 3 words — game over!</p>
                {highScore > 0 && (
                  <p className="text-blue-400 font-bold mb-4 flex items-center justify-center gap-1">
                    <Trophy className="w-4 h-4" />Best: {highScore} words
                  </p>
                )}
                <Button onClick={startGame} className="bg-primary text-white font-bold px-8">
                  Start Game
                </Button>
              </div>
            </div>
          )}
          {gameState === "over" && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/90 backdrop-blur-sm z-20">
              <div className="text-center px-6">
                <div className="text-5xl mb-4">💀</div>
                <h2 className="text-2xl font-black mb-1">Game Over!</h2>
                <p className="text-muted-foreground mb-2">You reached Wave {wave}</p>
                <p className="text-4xl font-black text-primary mb-1">{finalScoreRef.current} words</p>
                {finalScoreRef.current > 0 && (
                  <XpRewardLine xp={calculateGameXP("word-rain", finalScoreRef.current)} />
                )}
                {badgeJustUnlocked && (
                  <BadgeUnlockLine className="text-blue-400 font-bold mb-1 text-sm" glowColor="rgba(96, 165, 250, 0.7)">
                    🌧️ Word Warden badge unlocked!
                  </BadgeUnlockLine>
                )}
                {newHighScore && finalScoreRef.current > 0 && (
                  <p className="text-yellow-400 font-bold mb-2 text-sm">🏆 New High Score!</p>
                )}
                {!newHighScore && highScore > 0 && (
                  <p className="text-muted-foreground mb-2 text-sm">Best: {highScore} words</p>
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
                      className="flex-1 px-3 py-1.5 rounded-lg bg-card border border-blue-500/30 text-foreground text-sm focus:outline-none focus:border-primary min-w-0"
                      placeholder="Your nickname"
                      maxLength={20}
                    />
                    <Button
                      onClick={handleManualSubmit}
                      disabled={!nicknameInput.trim()}
                      size="sm"
                      className="bg-primary text-white shrink-0"
                    >
                      Submit
                    </Button>
                  </div>
                )}
                <div className="flex gap-3 justify-center">
                  <Button onClick={startGame} className="bg-primary text-white font-bold gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Play Again
                  </Button>
                  <Link href="/games"><Button variant="outline" className="border-border/60">Games Hub</Button></Link>
                </div>
              </div>
            </div>
          )}

          <AnimatePresence>
            {words.map(w => (
              <motion.div
                key={w.id}
                initial={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                className={`absolute px-3 py-1.5 rounded-full text-sm font-bold font-mono border transition-colors ${
                  destroyed.includes(w.id)
                    ? "bg-green-500/20 border-green-500/40 text-green-400"
                    : w.y > 70
                    ? "bg-red-500/20 border-red-500/40 text-red-300"
                    : "bg-blue-500/10 border-blue-500/30 text-blue-300"
                }`}
                style={{
                  left: `${w.x}%`,
                  top: `${w.y}%`,
                  transform: "translateX(-50%)",
                }}
              >
                {w.word}
              </motion.div>
            ))}
          </AnimatePresence>

          {gameState === "playing" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500/20">
              <div className="h-full w-full bg-red-500/40" />
            </div>
          )}
        </div>

        {gameState === "playing" && (
          <div className="mt-4">
            <input
              ref={inputRef}
              value={input}
              onChange={handleInput}
              className="w-full px-5 py-3 rounded-xl bg-card border border-primary/30 text-foreground font-mono text-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Type the falling words..."
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

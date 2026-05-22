import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RefreshCw, CloudRain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WORD_LIST } from "@/lib/words";

interface FallingWord {
  id: number;
  word: string;
  x: number;
  y: number;
  speed: number;
  matched: boolean;
}

let wordId = 0;

export default function WordRain() {
  const [words, setWords] = useState<FallingWord[]>([]);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [wave, setWave] = useState(1);
  const [gameState, setGameState] = useState<"idle" | "playing" | "over">("idle");
  const [destroyed, setDestroyed] = useState<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const animRef = useRef<number>(0);
  const wordsRef = useRef<FallingWord[]>([]);
  const lastSpawnRef = useRef<number>(0);
  const gameStateRef = useRef<"idle" | "playing" | "over">("idle");
  const waveRef = useRef(1);
  const livesRef = useRef(3);

  wordsRef.current = words;
  gameStateRef.current = gameState;
  waveRef.current = wave;
  livesRef.current = lives;

  useEffect(() => {
    document.title = "Word Rain | BoomType Games";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Play Word Rain on BoomType — type falling words before they hit the ground. Fun typing game that improves speed and reaction time.");
  }, []);

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
        if (newLives <= 0) {
          setGameState("over");
          gameStateRef.current = "over";
        } else {
          setLives(newLives);
        }
      }
      return updated.filter(w => w.y < 92 || w.matched);
    });

    animRef.current = requestAnimationFrame(gameLoop);
  }, [spawnWord]);

  const startGame = useCallback(() => {
    wordId = 0;
    lastSpawnRef.current = 0;
    setWords([]);
    setInput("");
    setScore(0);
    setLives(3);
    setWave(1);
    setDestroyed([]);
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
      setWave(w => { const nw = w + 1; waveRef.current = nw; return nw; });
    }
  }, [score]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);

    const match = wordsRef.current.find(w => !w.matched && w.word === val.trim());
    if (match) {
      setWords(prev => prev.map(w => w.id === match.id ? { ...w, matched: true } : w));
      setDestroyed(prev => [...prev, match.id]);
      setScore(s => s + 1);
      setInput("");
      setTimeout(() => {
        setWords(prev => prev.filter(w => w.id !== match.id));
        setDestroyed(prev => prev.filter(id => id !== match.id));
      }, 300);
    }
  }, []);

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
          {gameState === "idle" && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm z-20">
              <div className="text-center">
                <div className="text-5xl mb-4">🌧️</div>
                <h2 className="text-2xl font-black mb-2">Word Rain</h2>
                <p className="text-muted-foreground mb-6 max-w-xs">Words fall from the sky. Type them before they hit the ground. Miss 3 words — game over!</p>
                <Button onClick={startGame} className="bg-primary text-white font-bold px-8">
                  Start Game
                </Button>
              </div>
            </div>
          )}
          {gameState === "over" && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/90 backdrop-blur-sm z-20">
              <div className="text-center">
                <div className="text-5xl mb-4">💀</div>
                <h2 className="text-2xl font-black mb-1">Game Over!</h2>
                <p className="text-muted-foreground mb-2">You reached Wave {wave}</p>
                <p className="text-4xl font-black text-primary mb-6">{score} words</p>
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

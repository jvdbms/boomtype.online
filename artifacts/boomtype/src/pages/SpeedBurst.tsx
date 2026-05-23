import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RefreshCw, Zap, Trophy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WORD_LIST } from "@/lib/words";
import { useGameSounds } from "@/hooks/useGameSounds";
import { getNickname, setNickname } from "@/lib/storage";
import { useSubmitGameScore } from "@workspace/api-client-react";

const HIGH_SCORE_KEY = "boomtype_speedburst_hs";

interface Bubble {
  id: number;
  word: string;
  x: number;
  y: number;
  timeLeft: number;
  maxTime: number;
  popped: boolean;
}

let bubbleId = 0;

export default function SpeedBurst() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameState, setGameState] = useState<"idle" | "playing" | "over">("idle");
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem(HIGH_SCORE_KEY) || "0", 10));
  const [finalScore, setFinalScore] = useState(0);
  const [newHighScore, setNewHighScore] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const gameStateRef = useRef<"idle" | "playing" | "over">("idle");
  const bubblesRef = useRef<Bubble[]>([]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const comboRef = useRef(0);
  const { playCorrect, playGameOver, playCombo } = useGameSounds();
  const { mutate: submitScore } = useSubmitGameScore({
    mutation: { onSuccess: () => setScoreSubmitted(true) },
  });

  bubblesRef.current = bubbles;
  comboRef.current = combo;

  useEffect(() => {
    document.title = "Speed Burst | BoomType Games";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Play Speed Burst on BoomType — pop floating word bubbles by typing them before they disappear. Build combos for huge score multipliers!");
  }, []);

  const submitToLeaderboard = useCallback((fs: number, nick: string) => {
    if (!nick.trim() || fs <= 0) return;
    setNickname(nick.trim());
    submitScore({ data: { nickname: nick.trim(), game: "speed-burst", score: fs } });
  }, [submitScore]);

  const spawnBubble = useCallback(() => {
    const word = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    const maxTime = Math.max(3000, 7000 - word.length * 200);
    const b: Bubble = {
      id: ++bubbleId,
      word,
      x: 5 + Math.random() * 75,
      y: 10 + Math.random() * 65,
      timeLeft: maxTime,
      maxTime,
      popped: false,
    };
    setBubbles(prev => {
      if (prev.filter(b2 => !b2.popped).length >= 8) return prev;
      return [...prev, b];
    });
  }, []);

  const startGame = useCallback(() => {
    bubbleId = 0;
    setBubbles([]);
    setInput("");
    setScore(0);
    setCombo(0);
    comboRef.current = 0;
    setTimeLeft(60);
    setNewHighScore(false);
    setScoreSubmitted(false);
    setNicknameInput(getNickname());
    setGameState("playing");
    gameStateRef.current = "playing";
    inputRef.current?.focus();

    spawnRef.current = setInterval(spawnBubble, 1200);
    tickRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(tickRef.current!);
          clearInterval(spawnRef.current!);
          setGameState("over");
          gameStateRef.current = "over";
          playGameOver();
          setScore(s => {
            setFinalScore(s);
            const prevBest = parseInt(localStorage.getItem(HIGH_SCORE_KEY) || "0", 10);
            if (s > prevBest) {
              localStorage.setItem(HIGH_SCORE_KEY, s.toString());
              setHighScore(s);
              setNewHighScore(true);
            }
            const storedNick = getNickname();
            if (storedNick) {
              setNicknameInput(storedNick);
              setTimeout(() => submitToLeaderboard(s, storedNick), 0);
            }
            return s;
          });
          return 0;
        }
        return t - 1;
      });
      setBubbles(prev => prev.map(b => b.popped ? b : { ...b, timeLeft: b.timeLeft - 1000 }).filter(b => b.popped || b.timeLeft > 0));
    }, 1000);
  }, [spawnBubble, playGameOver, submitToLeaderboard]);

  useEffect(() => {
    return () => {
      clearInterval(tickRef.current!);
      clearInterval(spawnRef.current!);
    };
  }, []);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);

    const match = bubblesRef.current.find(b => !b.popped && b.word === val.trim());
    if (match) {
      setBubbles(prev => prev.map(b => b.id === match.id ? { ...b, popped: true } : b));
      setCombo(c => {
        const nc = c + 1;
        const multiplier = Math.max(1, Math.floor(nc / 3));
        if (nc > 0 && nc % 3 === 0) {
          playCombo(multiplier);
        } else {
          playCorrect();
        }
        setScore(s => s + 10 * multiplier);
        return nc;
      });
      setInput("");
      setTimeout(() => setBubbles(prev => prev.filter(b => b.id !== match.id)), 400);
    }
  }, [playCorrect, playCombo]);

  const handleManualSubmit = useCallback(() => {
    submitToLeaderboard(finalScore, nicknameInput);
  }, [submitToLeaderboard, finalScore, nicknameInput]);

  const multiplier = Math.max(1, Math.floor(combo / 3));

  return (
    <div className="min-h-screen py-4 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/games" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Zap className="w-6 h-6 text-purple-400" />
            Speed Burst
          </h1>
          <div className="ml-auto flex items-center gap-4 text-sm">
            <span className="font-bold text-primary">Score: {score}</span>
            {combo > 2 && <span className="font-bold text-yellow-400">{multiplier}x COMBO!</span>}
            <span className={`font-bold tabular-nums ${timeLeft <= 10 ? "text-red-400" : "text-foreground"}`}>{timeLeft}s</span>
          </div>
        </div>

        <div className="relative rounded-2xl bg-card border border-purple-500/20 overflow-hidden" style={{ height: "420px" }}>
          {gameState === "idle" && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm z-20">
              <div className="text-center">
                <div className="text-5xl mb-4">💥</div>
                <h2 className="text-2xl font-black mb-2">Speed Burst</h2>
                <p className="text-muted-foreground mb-4 max-w-xs">Bubbles appear with words. Type them to pop before they vanish. Build combos for multipliers!</p>
                {highScore > 0 && (
                  <p className="text-purple-400 font-bold mb-4 flex items-center justify-center gap-1">
                    <Trophy className="w-4 h-4" />Best: {highScore} pts
                  </p>
                )}
                <Button onClick={startGame} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8">
                  Start!
                </Button>
              </div>
            </div>
          )}
          {gameState === "over" && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/90 backdrop-blur-sm z-20">
              <div className="text-center px-6">
                <div className="text-5xl mb-3">🎉</div>
                <h2 className="text-2xl font-black mb-1">Time's Up!</h2>
                <p className="text-4xl font-black text-purple-400 mb-1">{finalScore} pts</p>
                {newHighScore && finalScore > 0 && (
                  <p className="text-yellow-400 font-bold mb-2 text-sm">🏆 New High Score!</p>
                )}
                {!newHighScore && highScore > 0 && (
                  <p className="text-muted-foreground mb-2 text-sm">Best: {highScore} pts</p>
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
                      className="flex-1 px-3 py-1.5 rounded-lg bg-card border border-purple-500/30 text-foreground text-sm focus:outline-none focus:border-purple-500 min-w-0"
                      placeholder="Your nickname"
                      maxLength={20}
                    />
                    <Button
                      onClick={handleManualSubmit}
                      disabled={!nicknameInput.trim()}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white shrink-0"
                    >
                      Submit
                    </Button>
                  </div>
                )}
                <div className="flex gap-3 justify-center">
                  <Button onClick={startGame} className="bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Play Again
                  </Button>
                  <Link href="/games"><Button variant="outline" className="border-border/60">Games Hub</Button></Link>
                </div>
              </div>
            </div>
          )}

          <AnimatePresence>
            {bubbles.map(b => {
              const pct = b.timeLeft / b.maxTime;
              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: b.popped ? 0 : 1, scale: b.popped ? 1.6 : 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute"
                  style={{ left: `${b.x}%`, top: `${b.y}%`, transform: "translate(-50%, -50%)" }}
                >
                  <div
                    className={`relative px-3 py-2 rounded-full border font-mono text-sm font-bold cursor-default select-none ${
                      b.popped
                        ? "bg-green-500/30 border-green-400 text-green-300"
                        : pct > 0.5
                        ? "bg-purple-500/15 border-purple-500/50 text-purple-300 hover:border-purple-400"
                        : pct > 0.25
                        ? "bg-yellow-500/15 border-yellow-500/50 text-yellow-300"
                        : "bg-red-500/15 border-red-500/50 text-red-300"
                    }`}
                  >
                    {b.popped ? "💥" : b.word}
                    {!b.popped && (
                      <div
                        className="absolute bottom-0 left-0 h-0.5 rounded-full bg-current opacity-40 transition-all"
                        style={{ width: `${pct * 100}%` }}
                      />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {gameState === "playing" && (
          <div className="mt-4">
            <input
              ref={inputRef}
              value={input}
              onChange={handleInput}
              className="w-full px-5 py-3 rounded-xl bg-card border border-purple-500/30 text-foreground font-mono text-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              placeholder="Type a bubble word to pop it..."
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

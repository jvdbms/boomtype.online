import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WORD_LIST, LESSON_WORDS } from "@/lib/words";
import { useGameSounds } from "@/hooks/useGameSounds";
import { addXP, awardGameBadge, calculateGameXP } from "@/lib/storage";

const HS_KEY = "boomtype_cloudrace_hs";
const RACE_DISTANCE = 100;
const DURATION = 60;

const KEY_SETS: Record<string, { label: string; words: string[] }> = {
  all:   { label: "All Words", words: WORD_LIST },
  home:  { label: "Home Row",  words: LESSON_WORDS[1] },
  top:   { label: "Top Row",   words: LESSON_WORDS[2] },
  speed: { label: "Speed",     words: LESSON_WORDS[4] },
};
const DIFFICULTIES = [
  { id: "easy",   label: "Easy",   cpuWpm: 25 },
  { id: "medium", label: "Medium", cpuWpm: 45 },
  { id: "hard",   label: "Hard",   cpuWpm: 65 },
];

function pickWord(pool: string[]): string {
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function CloudRace() {
  const [gameState, setGameState] = useState<"idle" | "countdown" | "racing" | "done">("idle");
  const [playerPos, setPlayerPos] = useState(0);
  const [cpuPos, setCpuPos] = useState(0);
  const [currentWord, setCurrentWord] = useState("");
  const [nextWord, setNextWord] = useState("");
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [wordsTyped, setWordsTyped] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem(HS_KEY) || "0", 10));
  const [keySet, setKeySet] = useState<keyof typeof KEY_SETS>("all");
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[0]);
  const [result, setResult] = useState<"win" | "lose" | "tie" | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [correctFlash, setCorrectFlash] = useState(false);
  const [cpuBurst, setCpuBurst] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const playerPosRef = useRef(0);
  const cpuPosRef = useRef(0);
  const wordsTypedRef = useRef(0);
  const { playCorrect, playGameOver, playCombo } = useGameSounds();
  playerPosRef.current = playerPos;
  cpuPosRef.current = cpuPos;
  wordsTypedRef.current = wordsTyped;

  const finishRace = useCallback((playerP: number, cpuP: number) => {
    const r = playerP >= RACE_DISTANCE && cpuP < RACE_DISTANCE ? "win"
      : cpuP >= RACE_DISTANCE && playerP < RACE_DISTANCE ? "lose"
      : playerP >= cpuP ? "win" : cpuP > playerP ? "lose" : "tie";
    setResult(r);
    setGameState("done");
    if (r === "win") {
      playCombo(5);
      if (wordsTypedRef.current > highScore) {
        setHighScore(wordsTypedRef.current);
        localStorage.setItem(HS_KEY, wordsTypedRef.current.toString());
      }
      addXP(calculateGameXP("cloud-race", wordsTypedRef.current));
      awardGameBadge("cloud-racer");
    } else {
      playGameOver();
      addXP(calculateGameXP("cloud-race", Math.floor(wordsTypedRef.current / 2)));
    }
  }, [highScore, playCombo, playGameOver]);

  const startRace = useCallback(() => {
    const pool = KEY_SETS[keySet].words;
    setPlayerPos(0); setCpuPos(0);
    setInput(""); setWordsTyped(0);
    setTimeLeft(DURATION); setResult(null);
    setCurrentWord(pickWord(pool));
    setNextWord(pickWord(pool));
    setCountdown(3);
    setGameState("countdown");
    playerPosRef.current = 0; cpuPosRef.current = 0; wordsTypedRef.current = 0;
  }, [keySet]);

  // Countdown
  useEffect(() => {
    if (gameState !== "countdown") return;
    const t = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(t); setGameState("racing"); inputRef.current?.focus(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [gameState]);

  // Timer + CPU
  useEffect(() => {
    if (gameState !== "racing") return;
    // Timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishRace(playerPosRef.current, cpuPosRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    // CPU movement — moves per word at configured WPM
    const cpuInterval = (60 / difficulty.cpuWpm) * 1000;
    const cpuStep = RACE_DISTANCE / (difficulty.cpuWpm * (DURATION / 60));
    const cpu = setInterval(() => {
      if (Math.random() < 0.15) { setCpuBurst(true); setTimeout(() => setCpuBurst(false), 300); }
      setCpuPos(prev => {
        const next = Math.min(prev + cpuStep + (Math.random() - 0.4) * cpuStep, RACE_DISTANCE);
        cpuPosRef.current = next;
        if (next >= RACE_DISTANCE) {
          clearInterval(cpu); clearInterval(timer);
          finishRace(playerPosRef.current, RACE_DISTANCE);
        }
        return next;
      });
    }, cpuInterval);
    return () => { clearInterval(timer); clearInterval(cpu); };
  }, [gameState, difficulty, finishRace]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    if (val.endsWith(" ") || val.toLowerCase().trim() === currentWord.toLowerCase()) {
      const typed = val.trim().toLowerCase();
      if (typed === currentWord.toLowerCase()) {
        playCorrect();
        setCorrectFlash(true);
        setTimeout(() => setCorrectFlash(false), 150);
        const step = RACE_DISTANCE / (difficulty.cpuWpm * (DURATION / 60)) * 1.4;
        setPlayerPos(prev => {
          const next = Math.min(prev + step, RACE_DISTANCE);
          playerPosRef.current = next;
          if (next >= RACE_DISTANCE) {
            const cpuP = cpuPosRef.current;
            setTimeout(() => finishRace(RACE_DISTANCE, cpuP), 100);
          }
          return next;
        });
        setWordsTyped(w => w + 1);
        const pool = KEY_SETS[keySet].words;
        setCurrentWord(nextWord);
        setNextWord(pickWord(pool));
        setInput("");
      }
    }
  };

  const timerPct = (timeLeft / DURATION) * 100;

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link href="/games" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />Games
          </Link>
          {gameState === "racing" && (
            <div className="flex gap-4 items-center">
              <span className="text-primary font-black tabular-nums">{wordsTyped} words</span>
              <span className={`font-black tabular-nums ${timeLeft <= 10 ? "text-red-400" : "text-muted-foreground"}`}>{timeLeft}s</span>
            </div>
          )}
        </div>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-black mb-1">☁️ Cloud Race</h1>
          <p className="text-muted-foreground text-sm">Type words to fly your cloud — beat the CPU to the finish line!</p>
        </div>

        {gameState === "idle" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
            <div className="rounded-2xl bg-card border border-border/60 p-8 max-w-sm w-full text-center">
              <div className="text-6xl mb-4">☁️</div>
              <h2 className="text-xl font-black mb-2">Cloud Race</h2>
              <p className="text-muted-foreground text-sm mb-5">Type words correctly to propel your cloud forward. Race the CPU — first to reach the finish line wins!</p>
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2 font-medium">DIFFICULTY</p>
                <div className="flex gap-2 justify-center">
                  {DIFFICULTIES.map(d => (
                    <button key={d.id} onClick={() => setDifficulty(d)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${difficulty.id === d.id ? "bg-primary/15 border-primary/40 text-primary" : "bg-card border-border/40 text-muted-foreground hover:text-foreground"}`}
                    >{d.label}</button>
                  ))}
                </div>
              </div>
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
              {highScore > 0 && <p className="text-xs text-yellow-400 mb-4"><Trophy className="w-3 h-3 inline mr-1" />Best win: {highScore} words</p>}
              <Button onClick={startRace} className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold">Start Race</Button>
            </div>
          </motion.div>
        )}

        {gameState === "countdown" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <motion.div key={countdown} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="text-9xl font-black text-primary"
            >{countdown}</motion.div>
            <p className="text-muted-foreground mt-4 text-lg font-bold">Get ready to type!</p>
          </motion.div>
        )}

        {gameState === "done" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center">
            <div className="rounded-2xl bg-card border border-border/60 p-8 max-w-sm w-full text-center">
              <div className="text-6xl mb-4">{result === "win" ? "🏆" : result === "tie" ? "🤝" : "😓"}</div>
              <h2 className="text-3xl font-black mb-2">
                {result === "win" ? "You Win!" : result === "tie" ? "It's a Tie!" : "CPU Wins!"}
              </h2>
              <div className="grid grid-cols-2 gap-3 my-5">
                <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-3">
                  <div className="text-2xl font-black text-blue-400">{Math.round(playerPos)}%</div>
                  <div className="text-xs text-muted-foreground">Your distance</div>
                </div>
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3">
                  <div className="text-2xl font-black text-red-400">{Math.round(cpuPos)}%</div>
                  <div className="text-xs text-muted-foreground">CPU distance</div>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-2">{wordsTyped} words typed in {DURATION - timeLeft}s</p>
              {(() => {
                const xp = result === "win"
                  ? calculateGameXP("cloud-race", wordsTyped)
                  : calculateGameXP("cloud-race", Math.floor(wordsTyped / 2));
                return xp > 0 ? (
                  <p className="text-yellow-400 font-bold mb-1 text-sm flex items-center justify-center gap-1">
                    ⚡ +{xp} XP earned
                  </p>
                ) : null;
              })()}
              {result === "win" && (
                <p className="text-sky-400 font-bold mb-4 text-sm">☁️ Cloud Racer badge unlocked!</p>
              )}
              <div className="flex gap-3">
                <Button onClick={startRace} className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold gap-1.5">
                  <RefreshCw className="w-4 h-4" />Race Again
                </Button>
                <Link href="/games"><Button variant="outline" className="flex-1 border-border/60">All Games</Button></Link>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === "racing" && (
          <div>
            {/* Timer bar */}
            <div className="h-1.5 bg-border/30 rounded-full mb-5 overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full" style={{ width: `${timerPct}%` }} />
            </div>

            {/* Race track */}
            <div className="relative rounded-2xl bg-gradient-to-r from-[hsl(220,47%,5%)] to-[hsl(220,47%,7%)] border border-border/60 p-6 mb-5 overflow-hidden">
              {/* Finish line */}
              <div className="absolute right-6 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 to-orange-500 opacity-60" />
              <div className="absolute right-3 top-1 text-xs text-yellow-400 font-bold opacity-80">FINISH</div>

              {/* Track lines */}
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="absolute border-dashed border-t border-white/5" style={{ top: `${20 + i * 15}%`, left: 0, right: 0 }} />
              ))}

              {/* Player cloud */}
              <div className="relative mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-blue-400">YOU</span>
                  <span className="text-xs text-muted-foreground">{Math.round(playerPos)}%</span>
                </div>
                <div className="relative h-12 bg-white/3 rounded-xl overflow-hidden border border-white/10">
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2 transition-all duration-300"
                    style={{ left: `${Math.min(playerPos, 96)}%` }}
                  >
                    <motion.div
                      animate={{ scale: correctFlash ? 1.3 : 1 }}
                      className="text-3xl filter drop-shadow-lg"
                    >☁️</motion.div>
                  </motion.div>
                </div>
              </div>

              {/* CPU cloud */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-red-400">CPU ({difficulty.label})</span>
                  <span className="text-xs text-muted-foreground">{Math.round(cpuPos)}%</span>
                </div>
                <div className="relative h-12 bg-white/3 rounded-xl overflow-hidden border border-white/10">
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2 transition-all duration-200"
                    style={{ left: `${Math.min(cpuPos, 96)}%` }}
                  >
                    <motion.div animate={{ scale: cpuBurst ? 1.2 : 1 }} className="text-3xl grayscale opacity-80">⛅</motion.div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Word to type */}
            <div className="rounded-2xl bg-card border border-border/60 p-5 mb-4 text-center">
              <div className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Type this word</div>
              <div className="text-4xl font-black text-primary mb-2">{currentWord}</div>
              <div className="text-sm text-muted-foreground">Next: <span className="text-foreground/50 font-mono">{nextWord}</span></div>
            </div>

            <input
              ref={inputRef}
              value={input}
              onChange={handleInput}
              className="w-full bg-card border border-border/60 focus:border-primary/60 rounded-2xl px-6 py-4 text-xl font-mono font-bold text-center outline-none transition-colors"
              placeholder="Type and press Space..."
              autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}

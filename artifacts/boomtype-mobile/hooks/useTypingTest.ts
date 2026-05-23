import { useCallback, useEffect, useRef, useState } from "react";
import { generateWords } from "@/constants/words";

export interface WordResult {
  word: string;
  typed: string;
  correct: boolean;
}

export interface TypingTestState {
  words: string[];
  currentWordIndex: number;
  currentInput: string;
  completedWords: WordResult[];
  wpm: number;
  timeLeft: number;
  phase: "idle" | "countdown" | "running" | "finished";
  countdown: number;
  accuracy: number;
  mistakes: number;
}

export function useTypingTest(duration: number) {
  const [state, setState] = useState<TypingTestState>({
    words: generateWords(80),
    currentWordIndex: 0,
    currentInput: "",
    completedWords: [],
    wpm: 0,
    timeLeft: duration,
    phase: "idle",
    countdown: 3,
    accuracy: 100,
    mistakes: 0,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    setState((s) => ({ ...s, phase: "countdown", countdown: 3 }));
  }, []);

  useEffect(() => {
    if (state.phase === "countdown") {
      timerRef.current = setInterval(() => {
        setState((s) => {
          if (s.countdown <= 1) {
            clearInterval(timerRef.current!);
            timerRef.current = null;
            startTimeRef.current = Date.now();
            return { ...s, phase: "running", countdown: 0, timeLeft: duration };
          }
          return { ...s, countdown: s.countdown - 1 };
        });
      }, 1000);
    }
    return clearTimers;
  }, [state.phase, duration, clearTimers]);

  useEffect(() => {
    if (state.phase === "running") {
      timerRef.current = setInterval(() => {
        setState((s) => {
          if (s.phase !== "running") return s;
          const elapsed = (Date.now() - startTimeRef.current) / 1000 / 60;
          const correctWords = s.completedWords.filter((w) => w.correct).length;
          const wpm = elapsed > 0 ? Math.round(correctWords / elapsed) : 0;
          const newTimeLeft = s.timeLeft - 1;

          if (newTimeLeft <= 0) {
            clearInterval(timerRef.current!);
            timerRef.current = null;
            return { ...s, timeLeft: 0, wpm, phase: "finished" };
          }
          return { ...s, timeLeft: newTimeLeft, wpm };
        });
      }, 1000);
    }
    return clearTimers;
  }, [state.phase, clearTimers]);

  const handleInput = useCallback((text: string) => {
    setState((s) => {
      if (s.phase !== "running") return s;

      if (text.endsWith(" ")) {
        const typed = text.slice(0, -1);
        const word = s.words[s.currentWordIndex];
        const correct = typed === word;
        const newCompleted: WordResult[] = [
          ...s.completedWords,
          { word, typed, correct },
        ];

        const totalMistakes = newCompleted.reduce((acc, r) => {
          if (!r.correct) {
            let m = 0;
            for (let i = 0; i < Math.max(r.word.length, r.typed.length); i++) {
              if (r.word[i] !== r.typed[i]) m++;
            }
            return acc + m;
          }
          return acc;
        }, 0);

        const totalChars = newCompleted.reduce(
          (acc, r) => acc + Math.max(r.word.length, r.typed.length),
          0
        );
        const accuracy = totalChars > 0 ? Math.max(0, Math.round((1 - totalMistakes / totalChars) * 100)) : 100;

        return {
          ...s,
          completedWords: newCompleted,
          currentWordIndex: s.currentWordIndex + 1,
          currentInput: "",
          accuracy,
          mistakes: totalMistakes,
        };
      }

      return { ...s, currentInput: text };
    });
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    setState({
      words: generateWords(80),
      currentWordIndex: 0,
      currentInput: "",
      completedWords: [],
      wpm: 0,
      timeLeft: duration,
      phase: "idle",
      countdown: 3,
      accuracy: 100,
      mistakes: 0,
    });
  }, [duration, clearTimers]);

  return { ...state, start, handleInput, reset };
}

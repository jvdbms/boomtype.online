import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const KEYS = {
  NICKNAME: "bt_nickname",
  TOTAL_XP: "bt_total_xp",
  STREAK_COUNT: "bt_streak_count",
  STREAK_DATE: "bt_streak_date",
  HIGH_SCORE: "bt_high_score",
};

interface UserState {
  nickname: string;
  totalXP: number;
  streak: number;
  highScore: number;
  loaded: boolean;
}

interface UserContextType extends UserState {
  setNickname: (name: string) => Promise<void>;
  addXP: (xp: number) => Promise<void>;
  updateStreak: () => Promise<number>;
  setHighScore: (wpm: number) => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<UserState>({
    nickname: "",
    totalXP: 0,
    streak: 0,
    highScore: 0,
    loaded: false,
  });

  useEffect(() => {
    (async () => {
      const [nickname, totalXP, streakCount, streakDate, highScore] = await Promise.all([
        AsyncStorage.getItem(KEYS.NICKNAME),
        AsyncStorage.getItem(KEYS.TOTAL_XP),
        AsyncStorage.getItem(KEYS.STREAK_COUNT),
        AsyncStorage.getItem(KEYS.STREAK_DATE),
        AsyncStorage.getItem(KEYS.HIGH_SCORE),
      ]);

      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      let currentStreak = parseInt(streakCount ?? "0", 10);
      if (streakDate !== today && streakDate !== yesterday) {
        currentStreak = 0;
      }

      setState({
        nickname: nickname ?? "",
        totalXP: parseInt(totalXP ?? "0", 10),
        streak: currentStreak,
        highScore: parseFloat(highScore ?? "0"),
        loaded: true,
      });
    })();
  }, []);

  const setNickname = useCallback(async (name: string) => {
    await AsyncStorage.setItem(KEYS.NICKNAME, name);
    setState((s) => ({ ...s, nickname: name }));
  }, []);

  const addXP = useCallback(async (xp: number) => {
    setState((s) => {
      const newXP = s.totalXP + xp;
      AsyncStorage.setItem(KEYS.TOTAL_XP, newXP.toString());
      return { ...s, totalXP: newXP };
    });
  }, []);

  const updateStreak = useCallback(async (): Promise<number> => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const streakDate = await AsyncStorage.getItem(KEYS.STREAK_DATE);
    const streakCount = parseInt((await AsyncStorage.getItem(KEYS.STREAK_COUNT)) ?? "0", 10);

    if (streakDate === today) {
      return streakCount;
    }

    const newCount = streakDate === yesterday ? streakCount + 1 : 1;
    await AsyncStorage.multiSet([
      [KEYS.STREAK_DATE, today],
      [KEYS.STREAK_COUNT, newCount.toString()],
    ]);
    setState((s) => ({ ...s, streak: newCount }));
    return newCount;
  }, []);

  const setHighScore = useCallback(async (wpm: number) => {
    setState((s) => {
      if (wpm > s.highScore) {
        AsyncStorage.setItem(KEYS.HIGH_SCORE, wpm.toString());
        return { ...s, highScore: wpm };
      }
      return s;
    });
  }, []);

  return (
    <UserContext.Provider value={{ ...state, setNickname, addXP, updateStreak, setHighScore }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
}

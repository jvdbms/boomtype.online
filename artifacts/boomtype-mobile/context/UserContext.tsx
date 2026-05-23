import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const KEYS = {
  NICKNAME: "bt_nickname",
  TOTAL_XP: "bt_total_xp",
  STREAK_COUNT: "bt_streak_count",
  STREAK_DATE: "bt_streak_date",
  HIGH_SCORE: "bt_high_score",
  HAPTICS_ENABLED: "bt_haptics_enabled",
  SOUND_ENABLED: "bt_sound_enabled",
};

interface UserState {
  nickname: string;
  totalXP: number;
  streak: number;
  highScore: number;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  loaded: boolean;
}

interface UserContextType extends UserState {
  setNickname: (name: string) => Promise<void>;
  addXP: (xp: number) => Promise<void>;
  updateStreak: () => Promise<number>;
  setHighScore: (wpm: number) => Promise<void>;
  setHapticsEnabled: (enabled: boolean) => Promise<void>;
  setSoundEnabled: (enabled: boolean) => Promise<void>;
  resetProgress: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<UserState>({
    nickname: "",
    totalXP: 0,
    streak: 0,
    highScore: 0,
    hapticsEnabled: true,
    soundEnabled: true,
    loaded: false,
  });

  useEffect(() => {
    (async () => {
      const [
        nickname,
        totalXP,
        streakCount,
        streakDate,
        highScore,
        hapticsEnabled,
        soundEnabled,
      ] = await Promise.all([
        AsyncStorage.getItem(KEYS.NICKNAME),
        AsyncStorage.getItem(KEYS.TOTAL_XP),
        AsyncStorage.getItem(KEYS.STREAK_COUNT),
        AsyncStorage.getItem(KEYS.STREAK_DATE),
        AsyncStorage.getItem(KEYS.HIGH_SCORE),
        AsyncStorage.getItem(KEYS.HAPTICS_ENABLED),
        AsyncStorage.getItem(KEYS.SOUND_ENABLED),
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
        hapticsEnabled: hapticsEnabled === null ? true : hapticsEnabled === "1",
        soundEnabled: soundEnabled === null ? true : soundEnabled === "1",
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

  const setHapticsEnabled = useCallback(async (enabled: boolean) => {
    await AsyncStorage.setItem(KEYS.HAPTICS_ENABLED, enabled ? "1" : "0");
    setState((s) => ({ ...s, hapticsEnabled: enabled }));
  }, []);

  const setSoundEnabled = useCallback(async (enabled: boolean) => {
    await AsyncStorage.setItem(KEYS.SOUND_ENABLED, enabled ? "1" : "0");
    setState((s) => ({ ...s, soundEnabled: enabled }));
  }, []);

  const resetProgress = useCallback(async () => {
    await AsyncStorage.multiRemove([
      KEYS.NICKNAME,
      KEYS.TOTAL_XP,
      KEYS.STREAK_COUNT,
      KEYS.STREAK_DATE,
      KEYS.HIGH_SCORE,
    ]);
    setState((s) => ({
      nickname: "",
      totalXP: 0,
      streak: 0,
      highScore: 0,
      hapticsEnabled: s.hapticsEnabled,
      soundEnabled: s.soundEnabled,
      loaded: true,
    }));
  }, []);

  return (
    <UserContext.Provider
      value={{
        ...state,
        setNickname,
        addXP,
        updateStreak,
        setHighScore,
        setHapticsEnabled,
        setSoundEnabled,
        resetProgress,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
}

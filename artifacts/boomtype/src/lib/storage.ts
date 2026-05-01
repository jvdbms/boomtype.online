const STORAGE_KEYS = {
  NICKNAME: "boomtype_nickname",
  HIGH_SCORE: "boomtype_high_score",
  TOTAL_XP: "boomtype_total_xp",
  STREAK_DATE: "boomtype_streak_date",
  STREAK_COUNT: "boomtype_streak_count",
  LAST_RESULT: "boomtype_last_result",
};

export interface TestResult {
  wpm: number;
  accuracy: number;
  mistakes: number;
  duration: number;
  nickname?: string;
  timestamp?: number;
}

export function getNickname(): string {
  return localStorage.getItem(STORAGE_KEYS.NICKNAME) || "";
}

export function setNickname(nickname: string): void {
  localStorage.setItem(STORAGE_KEYS.NICKNAME, nickname);
}

export function getHighScore(): number {
  return parseFloat(localStorage.getItem(STORAGE_KEYS.HIGH_SCORE) || "0");
}

export function setHighScore(wpm: number): void {
  const current = getHighScore();
  if (wpm > current) {
    localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, wpm.toString());
  }
}

export function getTotalXP(): number {
  return parseInt(localStorage.getItem(STORAGE_KEYS.TOTAL_XP) || "0", 10);
}

export function addXP(xp: number): void {
  const current = getTotalXP();
  localStorage.setItem(STORAGE_KEYS.TOTAL_XP, (current + xp).toString());
}

export function getStreak(): { count: number; isActiveToday: boolean } {
  const streakDate = localStorage.getItem(STORAGE_KEYS.STREAK_DATE);
  const streakCount = parseInt(localStorage.getItem(STORAGE_KEYS.STREAK_COUNT) || "0", 10);
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (streakDate === today) {
    return { count: streakCount, isActiveToday: true };
  } else if (streakDate === yesterday) {
    return { count: streakCount, isActiveToday: false };
  } else {
    return { count: 0, isActiveToday: false };
  }
}

export function updateStreak(): number {
  const { count, isActiveToday } = getStreak();
  const today = new Date().toDateString();

  if (isActiveToday) {
    return count;
  }

  const newCount = count + 1;
  localStorage.setItem(STORAGE_KEYS.STREAK_DATE, today);
  localStorage.setItem(STORAGE_KEYS.STREAK_COUNT, newCount.toString());
  return newCount;
}

export function saveLastResult(result: TestResult): void {
  localStorage.setItem(STORAGE_KEYS.LAST_RESULT, JSON.stringify({ ...result, timestamp: Date.now() }));
}

export function getLastResult(): TestResult | null {
  const stored = localStorage.getItem(STORAGE_KEYS.LAST_RESULT);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

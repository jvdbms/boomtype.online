const STORAGE_KEYS = {
  NICKNAME:           "boomtype_nickname",
  HIGH_SCORE:         "boomtype_high_score",
  TOTAL_XP:           "boomtype_total_xp",
  STREAK_DATE:        "boomtype_streak_date",
  STREAK_COUNT:       "boomtype_streak_count",
  LAST_RESULT:        "boomtype_last_result",
  TEST_HISTORY:       "boomtype_test_history",
  MISTAKE_HEATMAP:    "boomtype_mistake_heatmap",
  LB_SUBMIT_COUNT:    "boomtype_lb_submit_count",
  GAME_BADGES:        "boomtype_game_badges",
  GAME_XP:            "boomtype_game_xp",
};

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface TestResult {
  wpm: number;
  accuracy: number;
  mistakes: number;
  duration: number;
  nickname?: string;
  timestamp?: number;
  mistakeChars?: string[];
}

export interface TestHistoryItem {
  wpm: number;
  accuracy: number;
  mistakes: number;
  duration: number;
  timestamp: number;
  mistakeChars?: string[];
}

// ─────────────────────────────────────────────────────────────
// Nickname
// ─────────────────────────────────────────────────────────────

export function getNickname(): string {
  return localStorage.getItem(STORAGE_KEYS.NICKNAME) || "";
}

export function setNickname(nickname: string): void {
  localStorage.setItem(STORAGE_KEYS.NICKNAME, nickname);
}

// ─────────────────────────────────────────────────────────────
// High Score
// ─────────────────────────────────────────────────────────────

export function getHighScore(): number {
  return parseFloat(localStorage.getItem(STORAGE_KEYS.HIGH_SCORE) || "0");
}

export function setHighScore(wpm: number): void {
  if (wpm > getHighScore()) {
    localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, wpm.toString());
  }
}

// ─────────────────────────────────────────────────────────────
// XP
// ─────────────────────────────────────────────────────────────

export function getTotalXP(): number {
  return parseInt(localStorage.getItem(STORAGE_KEYS.TOTAL_XP) || "0", 10);
}

export function addXP(xp: number): void {
  localStorage.setItem(STORAGE_KEYS.TOTAL_XP, (getTotalXP() + xp).toString());
}

export function getGameXP(): number {
  return parseInt(localStorage.getItem(STORAGE_KEYS.GAME_XP) || "0", 10);
}

export function addGameXP(xp: number): void {
  localStorage.setItem(STORAGE_KEYS.GAME_XP, (getGameXP() + xp).toString());
  addXP(xp);
}

export function getTypingXP(): number {
  return Math.max(0, getTotalXP() - getGameXP());
}

// ─────────────────────────────────────────────────────────────
// Streak
// ─────────────────────────────────────────────────────────────

export function getStreak(): { count: number; isActiveToday: boolean } {
  const streakDate  = localStorage.getItem(STORAGE_KEYS.STREAK_DATE);
  const streakCount = parseInt(localStorage.getItem(STORAGE_KEYS.STREAK_COUNT) || "0", 10);
  const today       = new Date().toDateString();
  const yesterday   = new Date(Date.now() - 86400000).toDateString();

  if (streakDate === today)      return { count: streakCount, isActiveToday: true };
  if (streakDate === yesterday)  return { count: streakCount, isActiveToday: false };
  return { count: 0, isActiveToday: false };
}

export function updateStreak(): number {
  const { count, isActiveToday } = getStreak();
  if (isActiveToday) return count;
  const newCount = count + 1;
  localStorage.setItem(STORAGE_KEYS.STREAK_DATE,  new Date().toDateString());
  localStorage.setItem(STORAGE_KEYS.STREAK_COUNT, newCount.toString());
  return newCount;
}

// ─────────────────────────────────────────────────────────────
// Last Result (used by Results page)
// ─────────────────────────────────────────────────────────────

export function saveLastResult(result: TestResult): void {
  const item: TestResult = { ...result, timestamp: Date.now() };
  localStorage.setItem(STORAGE_KEYS.LAST_RESULT, JSON.stringify(item));
  // Also persist to rolling history
  saveTestHistory({
    wpm:          item.wpm,
    accuracy:     item.accuracy,
    mistakes:     item.mistakes,
    duration:     item.duration,
    timestamp:    item.timestamp!,
    mistakeChars: item.mistakeChars,
  });
}

export function getLastResult(): TestResult | null {
  const stored = localStorage.getItem(STORAGE_KEYS.LAST_RESULT);
  if (!stored) return null;
  try { return JSON.parse(stored); } catch { return null; }
}

// ─────────────────────────────────────────────────────────────
// Test History (last 30 results)
// ─────────────────────────────────────────────────────────────

export function getTestHistory(): TestHistoryItem[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.TEST_HISTORY) || "[]"); }
  catch { return []; }
}

export function saveTestHistory(item: TestHistoryItem): void {
  try {
    const history = getTestHistory();
    history.unshift(item);             // newest first
    localStorage.setItem(STORAGE_KEYS.TEST_HISTORY, JSON.stringify(history.slice(0, 30)));
    if (item.mistakeChars?.length) updateMistakeHeatmap(item.mistakeChars);
  } catch {}
}

// ─────────────────────────────────────────────────────────────
// Character Mistake Heatmap
// ─────────────────────────────────────────────────────────────

export function getMistakeHeatmap(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.MISTAKE_HEATMAP) || "{}"); }
  catch { return {}; }
}

function updateMistakeHeatmap(chars: string[]): void {
  try {
    const map = getMistakeHeatmap();
    chars.forEach(c => {
      const k = c.toLowerCase();
      if (k.length === 1) map[k] = (map[k] || 0) + 1;
    });
    localStorage.setItem(STORAGE_KEYS.MISTAKE_HEATMAP, JSON.stringify(map));
  } catch {}
}

export function clearMistakeHeatmap(): void {
  localStorage.removeItem(STORAGE_KEYS.MISTAKE_HEATMAP);
}

// ─────────────────────────────────────────────────────────────
// Leaderboard Submission Count → Premium badge
// ─────────────────────────────────────────────────────────────

export function getLeaderboardSubmitCount(): number {
  return parseInt(localStorage.getItem(STORAGE_KEYS.LB_SUBMIT_COUNT) || "0", 10);
}

export function incrementLeaderboardSubmits(): void {
  localStorage.setItem(STORAGE_KEYS.LB_SUBMIT_COUNT, (getLeaderboardSubmitCount() + 1).toString());
}

// ─────────────────────────────────────────────────────────────
// Insights
// ─────────────────────────────────────────────────────────────

export function getBestTimeOfDay(): string {
  const history = getTestHistory();
  if (history.length < 3) return "—";

  const buckets: Record<number, { total: number; count: number }> = {};
  history.forEach(item => {
    const h = new Date(item.timestamp).getHours();
    if (!buckets[h]) buckets[h] = { total: 0, count: 0 };
    buckets[h].total += item.wpm;
    buckets[h].count += 1;
  });

  let bestHour = -1, bestAvg = 0;
  Object.entries(buckets).forEach(([hour, { total, count }]) => {
    const avg = total / count;
    if (avg > bestAvg) { bestAvg = avg; bestHour = Number(hour); }
  });

  if (bestHour < 0) return "—";
  const period     = bestHour < 12 ? "AM" : "PM";
  const displayHr  = bestHour % 12 || 12;
  return `${displayHr}:00 ${period}`;
}

export function getWeeklyImprovement(): number {
  const history    = getTestHistory();
  const now        = Date.now();
  const oneWeekAgo = now - 7  * 86400000;
  const twoWksAgo  = now - 14 * 86400000;

  const thisWeek = history.filter(h => h.timestamp >= oneWeekAgo);
  const lastWeek = history.filter(h => h.timestamp >= twoWksAgo && h.timestamp < oneWeekAgo);

  if (!thisWeek.length || !lastWeek.length) return 0;
  const avg = (arr: TestHistoryItem[]) => arr.reduce((s, h) => s + h.wpm, 0) / arr.length;
  return Math.round(avg(thisWeek) - avg(lastWeek));
}

export function getAverageWpm(last = 10): number {
  const history = getTestHistory().slice(0, last);
  if (!history.length) return 0;
  return Math.round(history.reduce((s, h) => s + h.wpm, 0) / history.length);
}

// ─────────────────────────────────────────────────────────────
// Mini-Game Badges
// ─────────────────────────────────────────────────────────────

export interface GameBadgeDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const GAME_BADGE_DEFS: Record<string, GameBadgeDef> = {
  "zombie-slayer": {
    id: "zombie-slayer",
    name: "Zombie Slayer",
    description: "Kill 50 zombies in a single Zombie Attack game",
    icon: "🧟",
    color: "text-red-400",
  },
  "word-warden": {
    id: "word-warden",
    name: "Word Warden",
    description: "Destroy 30 words in a single Word Rain game",
    icon: "🌧️",
    color: "text-blue-400",
  },
  "speed-freak": {
    id: "speed-freak",
    name: "Speed Freak",
    description: "Score 50+ points in Speed Burst",
    icon: "⚡",
    color: "text-purple-400",
  },
  "bubble-master": {
    id: "bubble-master",
    name: "Bubble Master",
    description: "Score 100+ points in Bubble Pop",
    icon: "🫧",
    color: "text-cyan-400",
  },
  "tetris-master": {
    id: "tetris-master",
    name: "Tetris Master",
    description: "Clear 20+ words in Word Tetris",
    icon: "🧱",
    color: "text-orange-400",
  },
  "pipe-cleaner": {
    id: "pipe-cleaner",
    name: "Pipe Cleaner",
    description: "Clear 30+ words in Pipe Run",
    icon: "🔧",
    color: "text-green-400",
  },
  "alphabet-ace": {
    id: "alphabet-ace",
    name: "Alphabet Ace",
    description: "Complete A→Z in under 8 seconds",
    icon: "🔤",
    color: "text-yellow-400",
  },
  "cloud-racer": {
    id: "cloud-racer",
    name: "Cloud Racer",
    description: "Win a race in Cloud Race",
    icon: "☁️",
    color: "text-sky-400",
  },
};

export function getGameBadges(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME_BADGES) || "[]"); }
  catch { return []; }
}

export function awardGameBadge(badgeId: string): boolean {
  const badges = getGameBadges();
  if (badges.includes(badgeId)) return false;
  badges.push(badgeId);
  localStorage.setItem(STORAGE_KEYS.GAME_BADGES, JSON.stringify(badges));
  return true;
}

export function calculateGameXP(game: string, score: number): number {
  switch (game) {
    case "word-rain":     return score;
    case "zombie-attack": return score;
    case "speed-burst":   return Math.round(score / 5);
    case "bubble-pop":    return Math.round(score / 10);
    case "word-tetris":   return Math.round(score / 3);
    case "pipe-run":      return score;
    case "alphabet-race": return 20;
    case "cloud-race":    return score;
    default:              return Math.round(score / 2);
  }
}

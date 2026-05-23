export const WORD_LIST = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "it",
  "for", "not", "on", "with", "he", "as", "you", "do", "at", "this",
  "but", "his", "by", "from", "they", "we", "say", "her", "she", "or",
  "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know",
  "take", "people", "into", "year", "your", "good", "some", "could",
  "them", "see", "other", "than", "then", "now", "look", "only", "come",
  "its", "over", "think", "also", "back", "after", "use", "two", "how",
  "our", "work", "first", "well", "way", "even", "new", "want", "because",
  "any", "these", "give", "day", "most", "us", "great", "between", "need",
  "large", "often", "hand", "high", "place", "hold", "turn", "help",
  "point", "play", "small", "number", "off", "always", "move", "live",
  "still", "real", "life", "few", "open", "seem", "together", "next",
  "white", "begin", "walk", "example", "ease", "paper", "group", "every",
  "set", "second", "might", "different", "right", "each", "call", "long",
  "light", "write", "left", "keep", "read", "mind", "last", "stop",
  "change", "world", "around", "away", "own", "down", "run", "far",
  "plan", "line", "city", "house", "power", "town", "fine", "drive",
  "free", "true", "love", "fire", "face", "done", "once", "learn",
  "color", "dark", "since", "hard", "stand", "start", "never", "above",
  "night", "morning", "bring", "show", "hear", "follow", "form",
  "during", "heavy", "across", "study", "happen", "reason", "center",
  "force", "result", "inside", "simple", "until", "order", "level",
  "build", "focus", "range", "model", "store", "major", "ready", "month",
  "speak", "speed", "story", "check", "watch", "field", "later", "basic",
  "state", "raise", "quite", "terms", "along", "sound", "equal", "space",
  "water", "allow", "floor", "young", "early", "understand", "possible",
  "country", "produce", "surface", "common", "position", "travel",
  "natural", "material", "develop", "appear", "problem", "complete",
  "contain", "thought", "measure", "nothing", "through", "without",
  "question", "system",
];

export function generateWords(count: number = 60): string[] {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    words.push(WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]);
  }
  return words;
}

export function getLevel(wpm: number): string {
  if (wpm < 30) return "Beginner";
  if (wpm < 60) return "Intermediate";
  if (wpm < 90) return "Pro";
  return "Master";
}

export function getLevelColor(wpm: number): string {
  if (wpm < 30) return "#22c55e";
  if (wpm < 60) return "#3b7af7";
  if (wpm < 90) return "#8853e0";
  return "#f59e0b";
}

export function calculateXP(wpm: number, accuracy: number, duration: number): number {
  return Math.round(wpm * (accuracy / 100) * (duration / 30));
}

export const XP_PER_LEVEL = 500;

export interface XPLevelInfo {
  level: number;
  xpInLevel: number;
  xpToNext: number;
  progress: number;
}

export function getXPLevel(totalXP: number): XPLevelInfo {
  const safeXP = Math.max(0, totalXP);
  const level = Math.floor(safeXP / XP_PER_LEVEL) + 1;
  const xpInLevel = safeXP % XP_PER_LEVEL;
  const xpToNext = XP_PER_LEVEL - xpInLevel;
  return { level, xpInLevel, xpToNext, progress: xpInLevel / XP_PER_LEVEL };
}

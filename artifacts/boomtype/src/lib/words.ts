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
  "music", "school", "still", "real", "life", "few", "north", "open",
  "seem", "together", "next", "white", "children", "begin", "got", "walk",
  "example", "ease", "paper", "group", "always", "every", "near", "food",
  "set", "second", "might", "different", "right", "each", "call", "long",
  "light", "write", "left", "keep", "read", "mind", "last", "stop",
  "change", "world", "around", "air", "away", "hand", "word", "still",
  "own", "down", "run", "far", "plan", "line", "city", "move", "house",
  "power", "town", "fine", "drive", "spend", "blue", "clear", "tree",
  "free", "true", "love", "fire", "live", "face", "done", "once", "once",
  "learn", "plant", "cover", "color", "dark", "since", "hard", "stand",
  "start", "never", "above", "below", "close", "those", "both", "white",
  "black", "night", "morning", "bring", "show", "hear", "follow", "form",
  "during", "heavy", "dance", "across", "study", "prove", "happen",
  "reason", "center", "force", "result", "inside", "simple", "until",
  "order", "level", "build", "focus", "range", "model", "store", "major",
  "ready", "month", "speak", "speed", "story", "check", "watch", "field",
  "later", "basic", "state", "raise", "quite", "terms", "along", "sound",
  "equal", "space", "water", "allow", "floor", "floor", "stand", "floor",
];

export function generateWords(count: number = 50): string[] {
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

export function getLevelColor(level: string): string {
  switch (level) {
    case "Beginner": return "text-green-400";
    case "Intermediate": return "text-blue-400";
    case "Pro": return "text-purple-400";
    case "Master": return "text-yellow-400";
    default: return "text-gray-400";
  }
}

export function calculateXP(wpm: number, accuracy: number, duration: number): number {
  return Math.round(wpm * (accuracy / 100) * (duration / 30));
}

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
  "example", "ease", "paper", "group", "every", "near", "food",
  "set", "second", "might", "different", "right", "each", "call", "long",
  "light", "write", "left", "keep", "read", "mind", "last", "stop",
  "change", "world", "around", "air", "away", "hand", "word",
  "own", "down", "run", "far", "plan", "line", "city", "house",
  "power", "town", "fine", "drive", "spend", "blue", "clear", "tree",
  "free", "true", "love", "fire", "face", "done", "once",
  "learn", "plant", "cover", "color", "dark", "since", "hard", "stand",
  "start", "never", "above", "below", "close", "those", "both",
  "night", "morning", "bring", "show", "hear", "follow", "form",
  "during", "heavy", "dance", "across", "study", "prove", "happen",
  "reason", "center", "force", "result", "inside", "simple", "until",
  "order", "level", "build", "focus", "range", "model", "store", "major",
  "ready", "month", "speak", "speed", "story", "check", "watch", "field",
  "later", "basic", "state", "raise", "quite", "terms", "along", "sound",
  "equal", "space", "water", "allow", "floor", "young", "early", "often",
  "understand", "possible", "between", "country", "produce", "surface",
  "common", "position", "travel", "natural", "material", "develop",
  "appear", "problem", "complete", "contain", "thought", "measure",
  "nothing", "million", "through", "without", "question", "system",
];

export const LESSON_WORDS: Record<number, string[]> = {
  1: [
    "flask", "glad", "dash", "lads", "fad", "lass", "salad", "dad", "flags", "glass",
    "falls", "gala", "hall", "jab", "has", "had", "all", "fall", "ask", "as",
    "shall", "lad", "add", "slag", "flag", "fads", "dads", "gals", "jabs", "flak",
    "flask", "hash", "lash", "flash", "clash", "slash", "glad", "flags", "glass", "class",
    "alas", "saga", "data", "java", "jazz", "half", "calf", "alfa", "alba", "alga",
  ],
  2: [
    "quit", "quip", "trip", "riot", "poet", "tire", "wiry", "pout", "your", "tour",
    "rout", "pour", "type", "rope", "wore", "yore", "port", "euro", "zero", "oreo",
    "prey", "pure", "true", "pyre", "writ", "writ", "trop", "prop", "prep", "wire",
    "wirey", "towel", "tower", "power", "upper", "outer", "route", "trout", "tepoy",
  ],
  3: [
    "10", "20", "30", "40", "50", "60", "70", "80", "90", "100",
    "123", "456", "789", "2024", "2025", "1990", "3000", "500",
    "1 in 4", "3 out of 5", "42 points", "top 10", "win by 2",
    "score 95", "level 7", "room 404", "floor 3", "page 15",
    "10 words", "5 tests", "100 wpm", "99 percent", "7 days",
  ],
  4: [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "it",
    "for", "not", "on", "with", "he", "as", "you", "do", "at", "this",
    "she", "or", "an", "will", "my", "one", "all", "would", "there",
    "what", "so", "up", "out", "if", "about", "who", "get", "which",
    "go", "me", "when", "make", "can", "like", "time", "just", "know",
    "take", "them", "see", "other", "than", "then", "now", "look", "come",
    "think", "also", "back", "after", "use", "how", "work", "first", "well",
    "way", "even", "new", "want", "give", "day", "most", "us", "great",
  ],
  5: [
    "hello, world!", "yes, please.", "no, thanks.", "wait; I'll check.",
    "it's done.", "she's here.", "they've left.", "we're ready.",
    "don't stop.", "can't quit.", "isn't it?", "won't work.",
    "oh! really?", "wow, nice!", "yes? no!", "hmm... okay.",
    "first, second, third.", "a, b, and c.", "ready, set, go!",
    "type: fast, accurate, clean.",
  ],
  6: [
    "const x = 5;", "let name = '';", "if (x > 0) {}", "return true;",
    "function run() {}", "const arr = [];", "for (let i = 0;", "i < 10; i++)",
    "console.log(x);", "import React", "export default", "async function",
    "await fetch()", "try { } catch", "throw new Error", "type Props = {}",
    "interface User", "const [a, b]", "({key: value})", "=> result",
  ],
};

export function generateWords(count: number = 50): string[] {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    words.push(WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]);
  }
  return words;
}

export function generateLessonWords(lessonId: number, count: number = 60): string[] {
  const pool = LESSON_WORDS[lessonId] || WORD_LIST;
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    words.push(pool[Math.floor(Math.random() * pool.length)]);
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

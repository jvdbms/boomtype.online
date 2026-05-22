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

const LITERATURE_WORDS = [
  "it", "was", "the", "best", "of", "times", "worst", "age", "wisdom",
  "foolishness", "belief", "incredulity", "season", "light", "darkness",
  "hope", "despair", "everything", "nothing", "call", "me", "ishmael",
  "some", "years", "ago", "never", "mind", "how", "long", "precisely",
  "having", "little", "money", "pocket", "nothing", "particular",
  "interest", "shore", "thought", "would", "sail", "about", "little",
  "see", "watery", "part", "world", "whenever", "find", "myself",
  "growing", "grim", "mouth", "whenever", "damp", "drizzly", "november",
  "soul", "whenever", "find", "involuntarily", "pausing", "before",
  "coffin", "warehouses", "bringing", "up", "rear", "every", "funeral",
  "meet", "especially", "whenever", "hypos", "get", "such", "upper",
  "hand", "requires", "strong", "moral", "principle", "prevent",
  "deliberately", "stepping", "into", "street", "methodically",
  "knocking", "peoples", "hats", "off", "then", "account", "high",
  "time", "get", "sea", "soon", "possible",
];

const CODE_WORDS = [
  "const", "let", "var", "function", "return", "import", "export",
  "class", "interface", "type", "async", "await", "true", "false",
  "null", "undefined", "if", "else", "for", "while", "switch", "case",
  "break", "continue", "new", "this", "super", "extends", "implements",
  "public", "private", "static", "readonly", "string", "number", "boolean",
  "void", "any", "never", "array", "object", "map", "set", "promise",
  "console", "error", "fetch", "data", "state", "props", "event",
  "result", "value", "index", "length", "push", "pop", "filter", "map",
  "reduce", "find", "some", "every", "sort", "join", "split", "slice",
  "default", "module", "require", "resolve", "reject", "callback",
  "handler", "listener", "render", "component", "element", "node",
];

const RANDOM_SENTENCES = [
  "the quick brown fox jumps over the lazy dog",
  "pack my box with five dozen liquor jugs",
  "how vexingly quick daft zebras jump",
  "the five boxing wizards jump quickly",
  "sphinx of black quartz judge my vow",
  "two driven jocks help fax my big quiz",
  "the jay pig fox zebra and my wolves",
  "blowzy night frumps vex quotient djinns",
  "bright vixens jump dozy fowl quack",
  "five quacking zephyrs jolt my wax bed",
].flatMap(s => s.split(" "));

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
    "prey", "pure", "true", "pyre", "writ", "trop", "prop", "prep", "wire",
    "tower", "power", "upper", "outer", "route", "trout",
  ],
  3: [
    "10", "20", "30", "40", "50", "60", "70", "80", "90", "100",
    "123", "456", "789", "2024", "2025", "1990", "3000", "500",
    "42 points", "top 10", "win by 2",
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
    "hello, world!", "yes, please.", "no, thanks.", "wait; check.",
    "it's done.", "she's here.", "they've left.", "we're ready.",
    "don't stop.", "can't quit.", "isn't it?", "won't work.",
    "oh! really?", "wow, nice!", "hmm... okay.",
    "first, second, third.", "a, b, and c.", "ready, set, go!",
  ],
  6: [
    "const x = 5;", "let name = '';", "if (x > 0) {}", "return true;",
    "function run() {}", "const arr = [];", "for (let i = 0;", "i < 10; i++)",
    "console.log(x);", "import React", "export default", "async function",
    "await fetch()", "try { } catch", "throw new Error", "type Props = {}",
    "interface User", "const [a, b]", "({key: value})", "=> result",
  ],
  7: [
    "zinc", "zone", "zoom", "zeal", "zero", "zap", "zag",
    "clam", "clan", "clap", "claw", "clay", "clue",
    "verb", "vibe", "view", "vine", "vow",
    "name", "navy", "nab", "nag", "nap",
    "beam", "bean", "beat", "bell", "best", "bite", "blow",
    "moon", "mop", "mob", "mock", "moat", "moan",
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

export function generateCategoryWords(category: string, count: number = 80): string[] {
  let pool: string[];
  switch (category) {
    case "literature":
      pool = LITERATURE_WORDS;
      break;
    case "code":
      pool = CODE_WORDS;
      break;
    case "random":
      pool = RANDOM_SENTENCES;
      break;
    default:
      pool = WORD_LIST;
  }
  return Array.from({ length: count }, () => pool[Math.floor(Math.random() * pool.length)]);
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

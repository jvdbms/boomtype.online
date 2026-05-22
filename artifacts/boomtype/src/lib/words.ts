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
  "growing", "grim", "mouth", "damp", "drizzly", "november", "soul",
  "involuntarily", "pausing", "before", "coffin", "warehouses",
  "every", "funeral", "meet", "hypos", "strong", "moral", "principle",
  "deliberately", "stepping", "street", "methodically", "knocking",
  "peoples", "hats", "account", "high", "time", "sea", "possible",
];

const CODE_WORDS = [
  "const", "let", "var", "function", "return", "import", "export",
  "class", "interface", "type", "async", "await", "true", "false",
  "null", "undefined", "if", "else", "for", "while", "switch", "case",
  "break", "continue", "new", "this", "super", "extends", "implements",
  "public", "private", "static", "readonly", "string", "number", "boolean",
  "void", "any", "never", "array", "object", "map", "set", "promise",
  "console", "error", "fetch", "data", "state", "props", "event",
  "result", "value", "index", "length", "push", "pop", "filter",
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

// ─────────────────────────────────────────────────────────────
// LESSON WORD POOLS
// Each pool is carefully crafted so most characters belong to
// the lesson's target key set, building real finger memory.
// ─────────────────────────────────────────────────────────────
export const LESSON_WORDS: Record<number, string[]> = {

  // ── Lesson 1: Home Row  (A S D F G H J K L ;) ──────────────
  // Words built from ONLY home-row keys: a s d f g h j k l
  1: [
    // 2-3 letter drills
    "as", "ask", "ad", "ads", "all", "add", "ah",
    "gal", "gas", "gash", "gad", "gads", "gall",
    "had", "has", "hash", "half", "hall",
    "jag", "jags",
    "lag", "lags", "lad", "lads", "lass", "lash",
    "sad", "sag", "sal", "dad", "dads", "dash", "dal",
    "fad", "fads", "fall",
    // 4-5 letter words (home row only)
    "flag", "flak", "glad", "gala", "saga",
    "shag", "slag", "alas", "alga", "dhal",
    "falls", "halls", "flags", "galls", "slags",
    "glass", "flash", "flask", "slash", "shall",
    "galls", "galas", "sagas",
    // longer
    "salad", "flasks", "flasks", "glads", "flaks",
    "algal", "flashy",
    // repeat core for drilling
    "as", "ask", "all", "fall", "hall", "shall",
    "flash", "flask", "glass", "slash", "flag",
    "salad", "dash", "lash", "hash", "glad", "slag",
    "gala", "saga", "half", "lads", "fads",
  ],

  // ── Lesson 2: Top Row  (Q W E R T Y U I O P) ───────────────
  // Words built using many Q W E R T Y U I O P characters
  2: [
    // pure top-row words
    "type", "wire", "tire", "ripe", "pipe", "pore",
    "rope", "wore", "yore", "tore", "pure", "true",
    "tree", "trio", "trip", "riot", "poet", "tour",
    "pour", "your", "euro", "quit", "quip", "writ",
    "rout", "utter", "otter", "upper", "tower", "power",
    "outer", "route", "trout", "write", "quite", "quiet",
    "quote", "query", "pretty", "poetry", "porter",
    "petite", "topper", "toper", "rower", "pepper",
    "two", "port", "wore", "wiry", "pout", "zero",
    "tire", "wire", "pirouette", "rupture", "torture",
    "twitter", "twitter", "property", "priority",
    // repeat key patterns
    "type", "write", "quite", "quote", "power", "tower",
    "outer", "route", "trout", "pure", "true", "your",
    "tour", "pour", "quit", "query", "upper", "pretty",
    "poetry", "priority", "reporter", "territory",
    "popular", "typewriter",
  ],

  // ── Lesson 3: Number Row  (1 2 3 4 5 6 7 8 9 0) ────────────
  // Mixed number + short word drills
  3: [
    "10", "20", "30", "40", "50", "60", "70", "80", "90",
    "100", "200", "500", "1000",
    "12", "23", "34", "45", "56", "67", "78", "89", "90",
    "123", "234", "345", "456", "567", "678", "789",
    "1234", "2345", "3456", "4567", "5678", "6789",
    "12345", "23456", "34567", "45678",
    "2024", "2025", "1990", "2000", "1980",
    "100", "101", "404", "500", "999",
    "1", "2", "3", "4", "5", "6", "7", "8", "9", "0",
    "11", "22", "33", "44", "55", "66", "77", "88", "99",
    "10", "20", "30", "40", "50",
    "321", "654", "987", "111", "222", "333",
    "1010", "2020", "3030", "4040", "5050",
    "9876", "8765", "7654", "6543", "5432",
  ],

  // ── Lesson 4: Speed Drills  (all common words) ──────────────
  // High-frequency words for rhythm and speed
  4: [
    "the", "be", "to", "of", "and", "a", "in", "that",
    "have", "it", "for", "not", "on", "with", "he", "as",
    "you", "do", "at", "this", "she", "or", "an", "will",
    "my", "one", "all", "would", "there", "what", "so",
    "up", "out", "if", "about", "who", "get", "which",
    "go", "me", "when", "make", "can", "like", "time",
    "just", "know", "take", "them", "see", "other",
    "than", "then", "now", "look", "come", "think",
    "also", "back", "after", "use", "how", "work",
    "first", "well", "way", "even", "new", "want",
    "give", "day", "most", "us", "great", "hand",
    "high", "place", "hold", "turn", "help", "play",
    "small", "off", "always", "move", "live", "still",
    "real", "life", "open", "seem", "next", "begin",
  ],

  // ── Lesson 5: Advanced Punctuation  ( , . ; : ' " ! ? ) ────
  // Short phrases that use lots of punctuation marks
  5: [
    // commas
    "yes, please", "no, thanks", "wait, look",
    "one, two, three", "red, blue, green",
    "fast, clean, smart", "stop, think, act",
    // periods
    "go. stop. done.", "ok. yes. no.",
    "she left. he stayed.", "run. walk. sit.",
    // apostrophes
    "it's done", "she's here", "they've left",
    "we're ready", "don't stop", "can't quit",
    "isn't it", "won't work", "you're right",
    "I'll try", "he'd gone", "she'd left",
    // questions and exclamations
    "really? why?", "wow! great!", "oh! no!",
    "who? me? now?", "done? yes! great!",
    // semicolons and colons
    "ready; set; go", "fast; clean; done",
    "think: plan: act", "read: learn: grow",
    // mixed
    "hello, world!", "first, second, third.",
    "a, b, and c.", "ready, set, go!",
    "hmm... okay.", "well; done!",
    "I can't. you won't.", "she's fast; he's slow.",
    "red, white, and blue.", "eat, sleep, type.",
  ],

  // ── Lesson 6: Code Typing  ( { } [ ] ( ) < > = + - _ / \ ) ─
  // Code patterns and short snippets
  6: [
    "const x = 5",
    "let name = \"\"",
    "if (x > 0)",
    "if (x < 10)",
    "return true",
    "return false",
    "function run()",
    "const arr = []",
    "for (let i = 0)",
    "i < 10; i++",
    "while (true)",
    "console.log(x)",
    "import React",
    "export default",
    "async function",
    "await fetch(url)",
    "try { run() }",
    "catch (error)",
    "throw new Error()",
    "type Props = {}",
    "interface User {}",
    "const [a, b] = []",
    "{key: value}",
    "=> result",
    "arr.push(item)",
    "arr.filter(fn)",
    "x === y",
    "x !== y",
    "x >= 0",
    "x <= 100",
    "const sum = a + b",
    "const diff = a - b",
    "path/to/file",
    "src/index.ts",
    "<div className>",
    "</div>",
    "(a, b) => a + b",
    "{ ...spread }",
    "[...array]",
    "null ?? default",
    "x?.property",
  ],

  // ── Lesson 7: Bottom Row  (Z X C V B N M , . /) ─────────────
  // Words built using many bottom-row keys: z x c v b n m
  7: [
    // pure bottom-row emphasis
    "can", "van", "ban", "man", "bin", "cab", "nab",
    "max", "wax", "tax", "box", "fox", "fix", "mix",
    "vex", "hex", "nix", "vim", "bam", "mam",
    // 4-5 letter words heavy in bottom-row keys
    "cave", "cove", "gave", "have", "name", "came",
    "same", "game", "fame", "vane", "bane", "cane",
    "mane", "zone", "bone", "cone", "tone", "none",
    "come", "some", "home", "dome", "move", "love",
    "zinc", "vine", "mine", "fine", "line", "nine",
    "voice", "Joyce", "fence", "bench", "bunch",
    "lunch", "munch", "crunch",
    "cabin", "bacon", "basin", "raven", "maven",
    "novel", "level", "given", "seven", "eleven",
    "vacant", "vibrant", "combat", "command",
    "combine", "become", "volume", "vacuum",
    "balance", "advance", "machine", "maximum",
    // repeat core
    "can", "man", "box", "mix", "cave", "move",
    "zone", "come", "name", "came", "same", "game",
    "bone", "mine", "vine", "zinc", "cabin", "novel",
    "vacuum", "machine", "balance",
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
  // Shuffle properly with no immediate repeats
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const words: string[] = [];
  let lastWord = "";
  for (let i = 0; i < count; i++) {
    const idx = i % shuffled.length;
    // If we've looped through, re-shuffle to avoid repeats
    if (idx === 0 && i > 0) shuffled.sort(() => Math.random() - 0.5);
    let word = shuffled[idx];
    // Avoid consecutive duplicates
    if (word === lastWord) word = shuffled[(idx + 1) % shuffled.length] || word;
    words.push(word);
    lastWord = word;
  }
  return words;
}

export function generateCategoryWords(category: string, count: number = 80): string[] {
  let pool: string[];
  switch (category) {
    case "literature": pool = LITERATURE_WORDS; break;
    case "code":       pool = CODE_WORDS; break;
    case "random":     pool = RANDOM_SENTENCES; break;
    default:           pool = WORD_LIST;
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
    case "Beginner":     return "text-green-400";
    case "Intermediate": return "text-blue-400";
    case "Pro":          return "text-purple-400";
    case "Master":       return "text-yellow-400";
    default:             return "text-gray-400";
  }
}

export function calculateXP(wpm: number, accuracy: number, duration: number): number {
  return Math.round(wpm * (accuracy / 100) * (duration / 30));
}

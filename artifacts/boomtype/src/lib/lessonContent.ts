export type PhaseId = "letter" | "word" | "paragraph";

export interface RowLesson {
  id: number;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  color: string;
  rowKeys: string;
  focusKeyList: string[];
  tip: string;
  xpPerRound: number;
  letterRounds: string[];
  wordRounds: string[][];
  paragraphRounds: string[];
}

export const ROUNDS_PER_PHASE = 10;
export const PHASES_PER_LESSON = 3;
export const ROUNDS_PER_LESSON = ROUNDS_PER_PHASE * PHASES_PER_LESSON;
// Phases currently available to the user. All three are now live.
// Unlock math is based ONLY on enabled phases so the gating stays achievable.
export const ENABLED_PHASES: PhaseId[] = ["letter", "word", "paragraph"];
const ENABLED_ROUNDS = ENABLED_PHASES.length * ROUNDS_PER_PHASE;
export const UNLOCK_THRESHOLD = Math.ceil(ENABLED_ROUNDS * 0.8);

export const ROW_LESSONS: RowLesson[] = [
  {
    id: 1,
    title: "Home Row Keys",
    shortTitle: "Home Row",
    description: "A S D F G — H J K L ; — the foundation of touch typing.",
    icon: "🏠",
    color: "from-green-500 to-emerald-600",
    rowKeys: "a s d f g h j k l ;",
    focusKeyList: ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
    tip: "Rest fingers on ASDF and JKL; — never look down.",
    xpPerRound: 5,
    letterRounds: [
      "aaaaaaaaaa",
      "ssssssssss",
      "dddddddddd",
      "ffffffffff",
      "jjjjjjjjjj",
      "kkkkkkkkkk",
      "llllllllll",
      "asasasasas",
      "fjfjfjfjfj",
      "asdfjkl;as",
    ],
    wordRounds: [
      ["as", "ad", "al", "la", "ah", "ha"],
      ["sad", "had", "lad", "ash", "gas", "has"],
      ["dash", "gash", "lash", "hash", "gala", "flag"],
      ["flash", "clash", "slash", "glass", "flask"],
      ["flasks", "classy", "glassy"],
      ["as", "had", "sad", "lad", "ash", "al"],
      ["sad", "dash", "had", "lash", "gash"],
      ["dash", "flash", "lash", "clash"],
      ["flash", "classy", "slash", "glass"],
      ["as", "sad", "dash", "flash", "classy", "glass"],
    ],
    paragraphRounds: [
      "The home row is where your fingers rest.",
      "Place your hands on a s d f and j k l for the home keys.",
      "Strong home row skills make typing fast and easy.",
      "Practice every day to keep your fingers moving smoothly.",
      "Your left hand stays on a s d f while you type each line.",
      "Your right hand stays on j k l and the semicolon key.",
      "Good posture helps you type with steady hands and a calm mind.",
      "Keep your wrists straight and your fingers curved gently as you type.",
      "Always reach back to the home row after every key you press.",
      "A strong home row builds the steady base for all of your future typing.",
    ],
  },
  {
    id: 2,
    title: "Upper Row Keys",
    shortTitle: "Upper Row",
    description: "Q W E R T — Y U I O P — reach up without peeking.",
    icon: "⬆️",
    color: "from-blue-500 to-cyan-600",
    rowKeys: "q w e r t y u i o p",
    focusKeyList: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    tip: "Reach up from home row, then return your fingers home.",
    xpPerRound: 6,
    letterRounds: [
      "qqqqqqqqqq",
      "wwwwwwwwww",
      "eeeeeeeeee",
      "rrrrrrrrrr",
      "tttttttttt",
      "yyyyyyyyyy",
      "uuuuuuuuuu",
      "qwqwqwqwqw",
      "rtyurtyuoi",
      "qwertyuiop",
    ],
    wordRounds: [
      ["we", "it", "up", "or", "to", "ye"],
      ["you", "our", "two", "tip", "top", "pet"],
      ["your", "type", "pipe", "poet", "tour", "riot"],
      ["power", "tower", "write", "wrote", "quiet"],
      ["poetry", "report", "pretty"],
      ["we", "you", "it", "up", "or"],
      ["you", "type", "your", "pipe", "top"],
      ["type", "your", "power", "tower"],
      ["power", "tower", "poetry", "report"],
      ["we", "you", "type", "power", "poetry"],
    ],
    paragraphRounds: [
      "Reach up to the upper row from your home position.",
      "The upper row holds q w e r t y u i o p in order.",
      "Type quickly and your fingers will return home with ease.",
      "Power and poetry both live on this upper row of keys.",
      "Write the word type to practice the top keys today.",
      "A quiet writer tells a story with every single letter.",
      "Try to type with rhythm and your speed will rise quickly.",
      "Your eyes stay on the screen, never on the keys below.",
      "Quietly type your way through this upper row drill with patience.",
      "Practice the top row daily and your typing power will quickly grow.",
    ],
  },
  {
    id: 3,
    title: "Lower Row Keys",
    shortTitle: "Lower Row",
    description: "Z X C V B — N M , . / — confident downward reaches.",
    icon: "⬇️",
    color: "from-teal-500 to-cyan-600",
    rowKeys: "z x c v b n m , . /",
    focusKeyList: ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
    tip: "Curl your fingers down — keep wrists steady.",
    xpPerRound: 6,
    letterRounds: [
      "zzzzzzzzzz",
      "xxxxxxxxxx",
      "cccccccccc",
      "vvvvvvvvvv",
      "bbbbbbbbbb",
      "nnnnnnnnnn",
      "mmmmmmmmmm",
      "zxzxzxzxzx",
      "vbnmvbnmvb",
      "zxcvbnm,./",
    ],
    wordRounds: [
      ["an", "am", "no", "on", "in"],
      ["can", "van", "man", "ban", "men"],
      ["name", "came", "bank", "mean", "zinc"],
      ["cabin", "venom", "mince", "brain", "manic"],
      ["venoms", "cabins", "vacant"],
      ["an", "am", "can", "van", "men"],
      ["can", "van", "name", "bank", "mean"],
      ["name", "came", "venom", "cabin"],
      ["venom", "cabin", "vacant", "venoms"],
      ["can", "van", "name", "venom", "vacant"],
    ],
    paragraphRounds: [
      "Curl your fingers down to reach the lower row keys.",
      "Type names of common objects to drill the lower row.",
      "A cabin in the woods is calm and quiet at night.",
      "Many can climb the mountain with a brave heart.",
      "Bring a brown bag and a fine pen to class today.",
      "Calm minds and steady hands make for better typing.",
      "Type each comma, period, and slash with extra care.",
      "Move slowly until your accuracy is high, then build up speed.",
      "Even the bottom row needs daily practice to stay sharp.",
      "Number names like one, two, and three use these lower keys often.",
    ],
  },
  {
    id: 4,
    title: "Number Row Keys",
    shortTitle: "Numbers",
    description: "1 2 3 4 5 — 6 7 8 9 0 — master the digits.",
    icon: "🔢",
    color: "from-yellow-500 to-amber-600",
    rowKeys: "1 2 3 4 5 6 7 8 9 0",
    focusKeyList: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    tip: "Each digit has a finger. 4 & 5 use index, 6 & 7 the other index.",
    xpPerRound: 7,
    letterRounds: [
      "1111111111",
      "2222222222",
      "3333333333",
      "4444444444",
      "5555555555",
      "6666666666",
      "7777777777",
      "8888888888",
      "9999999999",
      "1234567890",
    ],
    wordRounds: [
      ["1", "1", "1", "1", "2", "2", "2", "2", "3", "3", "3", "3"],
      ["12", "23", "34", "45", "56", "67", "78", "89", "90"],
      ["123", "456", "789", "100", "200", "300"],
      ["1234", "5678", "9012", "3456"],
      ["12345", "67890", "11111", "22222"],
      ["12", "345", "6789", "10"],
      ["100", "200", "55", "77", "99"],
      ["1234", "567", "89", "0"],
      ["9", "87", "654", "3210"],
      ["11", "22", "333", "4444", "55555", "67890"],
    ],
    paragraphRounds: [
      "Type 1 2 3 to start a simple count.",
      "The year 2025 is now and 2026 is next.",
      "There are 7 days in 1 week and 12 months in 1 year.",
      "Add 10 plus 20 to get 30 and 40 plus 50 to get 90.",
      "My phone code is 4 8 1 5 1 6 2 3 4 2.",
      "In 1969 humans first walked on the moon.",
      "She typed 65 words per minute on her 3rd try.",
      "There are 24 hours in 1 day and 60 minutes in 1 hour.",
      "The pin is 0 0 0 0 and the backup code is 1 2 3 4.",
      "Type 100 200 300 400 500 to drill the top row of numbers.",
    ],
  },
];

export const LESSON_BY_ID: Record<number, RowLesson> = Object.fromEntries(
  ROW_LESSONS.map((l) => [l.id, l]),
);

// ── Progress storage ────────────────────────────────────────
export interface PhaseProgress {
  letter: number;
  word: number;
  paragraph: number;
}

export type LessonProgressMap = Record<number, PhaseProgress>;

const PROGRESS_KEY = "boomtype_lesson_progress_v2";

function emptyPhases(): PhaseProgress {
  return { letter: 0, word: 0, paragraph: 0 };
}

export function getLessonProgress(): LessonProgressMap {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as LessonProgressMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function getPhaseProgress(lessonId: number): PhaseProgress {
  return getLessonProgress()[lessonId] || emptyPhases();
}

export function setRoundCompleted(
  lessonId: number,
  phase: PhaseId,
  roundIndex: number,
): PhaseProgress {
  const all = getLessonProgress();
  const lesson = all[lessonId] || emptyPhases();
  const nextRound = Math.max(lesson[phase], roundIndex + 1);
  const updated: PhaseProgress = { ...lesson, [phase]: Math.min(nextRound, ROUNDS_PER_PHASE) };
  all[lessonId] = updated;
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
  } catch {}
  return updated;
}

export function lessonRoundsCompleted(p: PhaseProgress): number {
  return p.letter + p.word + p.paragraph;
}

export function enabledRoundsCompleted(p: PhaseProgress): number {
  return ENABLED_PHASES.reduce((sum, ph) => sum + p[ph], 0);
}

export function isLessonUnlocked(lessonId: number, all: LessonProgressMap): boolean {
  if (lessonId <= 1) return true;
  const prev = all[lessonId - 1];
  if (!prev) return false;
  return enabledRoundsCompleted(prev) >= UNLOCK_THRESHOLD;
}

export function isLessonComplete(p: PhaseProgress): boolean {
  return p.letter === ROUNDS_PER_PHASE && p.word === ROUNDS_PER_PHASE && p.paragraph === ROUNDS_PER_PHASE;
}

// Sequential phase unlock within a lesson:
//   Letter     → always unlocked
//   Word       → previous phase (Letter) fully complete (10/10)
//   Paragraph  → previous phase (Word)   fully complete (10/10)
// Phases not in ENABLED_PHASES are globally locked regardless of progress.
export function isPhaseUnlocked(phase: PhaseId, p: PhaseProgress): boolean {
  if (!ENABLED_PHASES.includes(phase)) return false;
  if (phase === "letter") return true;
  if (phase === "word") return p.letter >= ROUNDS_PER_PHASE;
  return p.word >= ROUNDS_PER_PHASE;
}

// What the user still needs to finish in the previous phase to unlock `phase`.
// Returns null if already unlocked or the phase has no prerequisite.
export function phaseUnlockHint(phase: PhaseId, p: PhaseProgress): string | null {
  if (isPhaseUnlocked(phase, p)) return null;
  if (phase === "word") {
    const left = Math.max(0, ROUNDS_PER_PHASE - p.letter);
    return `Finish ${left} more Letter round${left === 1 ? "" : "s"}`;
  }
  if (phase === "paragraph") {
    const left = Math.max(0, ROUNDS_PER_PHASE - p.word);
    return `Finish ${left} more Word round${left === 1 ? "" : "s"}`;
  }
  return null;
}

// Latest phase the user is allowed to enter for a given lesson.
export function latestUnlockedPhase(p: PhaseProgress): PhaseId {
  if (isPhaseUnlocked("paragraph", p)) return "paragraph";
  if (isPhaseUnlocked("word", p)) return "word";
  return "letter";
}

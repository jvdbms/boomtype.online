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
}

export const ROUNDS_PER_PHASE = 10;
export const PHASES_PER_LESSON = 3;
export const ROUNDS_PER_LESSON = ROUNDS_PER_PHASE * PHASES_PER_LESSON;
// Phases currently available to the user. Word & Paragraph come in follow-ups.
// Unlock math is based ONLY on enabled phases so the gating stays achievable.
export const ENABLED_PHASES: PhaseId[] = ["letter"];
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

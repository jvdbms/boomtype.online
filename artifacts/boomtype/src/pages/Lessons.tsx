import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Lock, Zap, Crown, Clock, Target, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import KeyboardVisualizer from "@/components/KeyboardVisualizer";

const DRILL_CATEGORIES = [
  { id: "all", label: "All Lessons" },
  { id: "home", label: "Home Row" },
  { id: "top", label: "Top Row" },
  { id: "bottom", label: "Bottom Row" },
  { id: "numbers", label: "Numbers" },
  { id: "punctuation", label: "Punctuation" },
  { id: "advanced", label: "Advanced" },
];

const lessons = [
  {
    id: 1,
    title: "Home Row Mastery",
    description: "Master ASDF and JKL; — the foundation of touch typing. Every key reaches from here.",
    difficulty: "Beginner",
    duration: "30s test",
    focus: "ASDF JKL;",
    premium: false,
    color: "from-green-500/20 to-emerald-500/10",
    borderColor: "border-green-500/30",
    textColor: "text-green-400",
    category: "home",
    highlightKeys: "asdf",
  },
  {
    id: 2,
    title: "Top Row Speed",
    description: "Practice QWERTY and YUIOP for maximum finger efficiency and reach.",
    difficulty: "Beginner",
    duration: "30s test",
    focus: "QWERTY YUIOP",
    premium: false,
    color: "from-blue-500/20 to-cyan-500/10",
    borderColor: "border-blue-500/30",
    textColor: "text-blue-400",
    category: "top",
    highlightKeys: "qwerty",
  },
  {
    id: 3,
    title: "Number Row Precision",
    description: "Conquer the number row without looking down. Essential for data entry and coding.",
    difficulty: "Intermediate",
    duration: "30s test",
    focus: "1234567890",
    premium: false,
    color: "from-yellow-500/20 to-amber-500/10",
    borderColor: "border-yellow-500/30",
    textColor: "text-yellow-400",
    category: "numbers",
    highlightKeys: "",
  },
  {
    id: 4,
    title: "Speed Drills",
    description: "High-intensity drills with the most common English words to push your WPM beyond 60.",
    difficulty: "Intermediate",
    duration: "60s test",
    focus: "Common words",
    premium: false,
    color: "from-orange-500/20 to-red-500/10",
    borderColor: "border-orange-500/30",
    textColor: "text-orange-400",
    category: "all",
    highlightKeys: "",
  },
  {
    id: 5,
    title: "Advanced Punctuation",
    description: "Master commas, semicolons, quotes, and special characters to type like a professional.",
    difficulty: "Pro",
    duration: "60s test",
    focus: "!@#$%,;:'\"",
    premium: true,
    color: "from-purple-500/20 to-violet-500/10",
    borderColor: "border-purple-500/30",
    textColor: "text-purple-400",
    category: "punctuation",
    highlightKeys: "",
  },
  {
    id: 6,
    title: "Code Typing",
    description: "Practice typing code snippets, brackets, and symbols used in programming every day.",
    difficulty: "Master",
    duration: "60s test",
    focus: "{}[]()<>",
    premium: true,
    color: "from-pink-500/20 to-rose-500/10",
    borderColor: "border-pink-500/30",
    textColor: "text-pink-400",
    category: "advanced",
    highlightKeys: "",
  },
  {
    id: 7,
    title: "Bottom Row Basics",
    description: "Master ZXCV and BNM for complete touch typing coverage with pinky and ring fingers.",
    difficulty: "Beginner",
    duration: "30s test",
    focus: "ZXCV BNM",
    premium: false,
    color: "from-teal-500/20 to-cyan-500/10",
    borderColor: "border-teal-500/30",
    textColor: "text-teal-400",
    category: "bottom",
    highlightKeys: "zxcv",
  },
];

const difficultyColors: Record<string, string> = {
  Beginner: "text-green-400",
  Intermediate: "text-blue-400",
  Pro: "text-purple-400",
  Master: "text-yellow-400",
};

export default function Lessons() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [hoverLesson, setHoverLesson] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Typing Lessons | BoomType — Learn to Type Faster";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Structured typing lessons from home row basics to advanced code typing. Build your WPM systematically.");
  }, []);

  const filteredLessons = activeCategory === "all"
    ? lessons
    : lessons.filter(l => l.category === activeCategory);

  const hoveredLesson = lessons.find(l => l.id === hoverLesson);

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            Structured Learning
          </div>
          <h1 className="text-4xl font-black mb-3">Typing Lessons</h1>
          <p className="text-muted-foreground text-lg">Build your skills systematically from beginner to master</p>
        </div>

        {/* Drill Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {DRILL_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                activeCategory === cat.id
                  ? "bg-primary/15 text-primary border-primary/30"
                  : "bg-card border-border/40 text-muted-foreground hover:text-foreground hover:border-border/60"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Keyboard Visualizer */}
        <div className="mb-8">
          <KeyboardVisualizer highlightKey={hoveredLesson?.highlightKeys?.[0]} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredLessons.map((lesson, i) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`relative rounded-2xl bg-gradient-to-br ${lesson.color} border ${lesson.borderColor} p-6 ${lesson.premium ? "opacity-80" : ""}`}
              data-testid={`lesson-card-${lesson.id}`}
              onMouseEnter={() => setHoverLesson(lesson.id)}
              onMouseLeave={() => setHoverLesson(null)}
            >
              {lesson.premium && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/20 border border-accent/30 text-xs font-bold text-accent">
                  <Crown className="w-3 h-3" />
                  Premium
                </div>
              )}

              <div className="mb-4">
                <span className={`text-xs font-bold uppercase tracking-wide ${difficultyColors[lesson.difficulty]}`}>
                  {lesson.difficulty}
                </span>
                <h3 className="text-xl font-black mt-1 mb-2">{lesson.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{lesson.description}</p>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-5">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {lesson.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" />
                  {lesson.focus}
                </span>
              </div>

              {lesson.premium ? (
                <Link href="/premium">
                  <Button size="sm" className="w-full bg-gradient-to-r from-primary to-accent text-white font-semibold gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    Unlock with Premium
                  </Button>
                </Link>
              ) : (
                <Link href={`/lessons/${lesson.id}`}>
                  <Button size="sm" variant="outline" className={`w-full border ${lesson.borderColor} ${lesson.textColor} hover:bg-white/5 gap-1.5`}>
                    <Zap className="w-3.5 h-3.5" />
                    Start Lesson
                  </Button>
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        {/* Premium Promo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10 relative rounded-3xl overflow-hidden p-8 text-center border border-accent/20"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/10" />
          <div className="relative z-10">
            <Crown className="w-10 h-10 text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-black mb-2">Unlock All Lessons</h2>
            <p className="text-muted-foreground mb-6">Get Premium for $4.99/mo — Advanced lessons, no ads, detailed analytics, and certificates.</p>
            <Link href="/premium">
              <Button className="bg-gradient-to-r from-primary to-accent text-white font-bold gap-2 px-8">
                <Crown className="w-4 h-4" />
                Upgrade to Premium
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

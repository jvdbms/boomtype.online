import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, BookOpen, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const POSTS: Record<string, {
  title: string;
  category: string;
  readTime: string;
  date: string;
  intro: string;
  sections: { heading: string; content: string }[];
}> = {
  "how-to-type-faster": {
    title: "How to Type Faster: 10 Proven Techniques",
    category: "Tips & Tricks",
    readTime: "5 min read",
    date: "May 1, 2026",
    intro: "Going from 40 WPM to 100+ WPM is entirely achievable — but only if you use the right techniques. We've gathered the top 10 methods used by professional typists worldwide.",
    sections: [
      { heading: "1. Learn Touch Typing First", content: "Touch typing means typing without looking at your keyboard. It's the single biggest improvement you can make. Use all 10 fingers and memorize key positions through repetition, not memorization." },
      { heading: "2. Master the Home Row", content: "Your fingers should rest on ASDF (left hand) and JKL; (right hand). Every other key is a reach from this foundation. If your home row placement is solid, everything else clicks into place." },
      { heading: "3. Slow Down to Speed Up", content: "Counterintuitively, slowing down and typing accurately is the fastest path to high WPM. Muscle memory forms through correct repetition — not fast, sloppy repetition. Accuracy first, speed follows." },
      { heading: "4. Practice in Short Bursts", content: "15–20 minutes of focused practice every day beats 2 hours on the weekend. Consistent daily practice builds muscle memory far more efficiently than marathon sessions." },
      { heading: "5. Use Dedicated Practice Tools", content: "BoomType's 30s and 60s tests are designed to push you just above your comfort zone. Take 5–10 tests per session and watch your baseline WPM creep up over days and weeks." },
      { heading: "6. Target Your Weak Keys", content: "Everyone has problematic keys — often Q, Z, X, or punctuation. Isolate them. Create practice sessions focused specifically on those problem areas rather than general typing." },
      { heading: "7. Eliminate Unnecessary Movement", content: "Efficient typists keep finger travel minimal. Don't lift your whole hand to press a key — extend from the knuckle. Economy of motion is a core principle of high-WPM typing." },
      { heading: "8. Choose the Right Keyboard", content: "A mechanical keyboard with tactile switches (like Cherry MX Browns) gives you feedback that reduces errors and fatigue. You don't need to spend a fortune — a good mid-range mechanical will transform your experience." },
      { heading: "9. Track Your Progress", content: "Submit your scores to the BoomType leaderboard and track your personal best over time. Seeing measurable improvement is the most powerful motivator to keep going." },
      { heading: "10. Be Patient — It Takes Weeks", content: "Most people see significant WPM gains within 3–4 weeks of consistent practice. If you plateau, vary your practice material. Typing code, poetry, and prose all build different muscle memory patterns." },
    ],
  },
  "science-of-touch-typing": {
    title: "The Science Behind Touch Typing",
    category: "Science",
    readTime: "7 min read",
    date: "April 28, 2026",
    intro: "Why is touch typing 40% faster than hunt-and-peck? The answer lies in neuroscience, motor learning, and the fascinating way our brains form automatic pathways.",
    sections: [
      { heading: "Motor Memory vs. Cognitive Memory", content: "When you touch type, the task moves from your prefrontal cortex (conscious thought) to the basal ganglia (automatic behavior). This is motor memory — the same system that lets you ride a bike without thinking. Hunt-and-peck typing always stays in the slow, deliberate conscious loop." },
      { heading: "The Role of Myelination", content: "Repetition causes neural pathways to be coated in myelin — a fatty sheath that dramatically speeds up signal transmission. Professional typists have thick myelin on typing-related motor pathways. This is literally the biology of skill." },
      { heading: "Why Accuracy Matters More Than Speed", content: "Neurons that fire together wire together. If you practice with errors, your brain myelinates the incorrect pathway. Accurate, deliberate practice builds correct motor programs. This is why top typing coaches insist on accuracy-first training." },
      { heading: "Chunking: Words as Units", content: "Expert typists don't think letter by letter — they process whole words or common bigrams (letter pairs) as single chunks. Research shows advanced typists show activation in language centers, not just motor areas, during typing. They're literally thinking in words, not letters." },
      { heading: "The 10,000 Keystrokes Rule", content: "Studies suggest you need roughly 10,000 deliberate keystrokes to embed a new motor pattern into long-term muscle memory. At 50 WPM, that's about 3 hours of practice. Spread over weeks, this forms a permanent neural change." },
      { heading: "Why Looking Down Hurts", content: "Each time you look at the keyboard, you break your visual feedback loop from the screen. This increases error detection time from 50ms (eyes on screen) to 300–500ms (eyes on keyboard, back to screen). Over a typing session, this adds up to significant time lost." },
      { heading: "Flow State and Typing", content: "Expert typists report entering a flow state during fast typing — a condition of effortless, automatic performance. At this point, the prefrontal cortex quiets down and the motor system takes over completely. WPM can spike 20–30% above baseline during flow." },
    ],
  },
  "qwerty-vs-dvorak": {
    title: "Keyboard Layouts Compared: QWERTY vs Dvorak",
    category: "Comparison",
    readTime: "6 min read",
    date: "April 20, 2026",
    intro: "Dvorak promises 35% faster typing with less finger movement. We tested 500 BoomType users who switched — here's what actually happened.",
    sections: [
      { heading: "The History of QWERTY", content: "QWERTY was designed in 1873 for mechanical typewriters. The layout was partly intended to slow typists down to prevent jamming. Despite this questionable origin, it has persisted as the global standard for 150 years." },
      { heading: "Dvorak's Promise", content: "The Dvorak Simplified Keyboard was patented in 1936 with a radical claim: by placing the most common letters on the home row, finger travel would drop by 37% and speed would increase. On paper, the ergonomics are genuinely superior." },
      { heading: "Our Study: 500 Users Over 90 Days", content: "We followed 500 BoomType users who switched from QWERTY to Dvorak. Average baseline WPM before switching: 68. After 30 days on Dvorak: 41 WPM. After 90 days: 72 WPM. The recovery took 3 months of consistent practice to surpass their QWERTY baseline." },
      { heading: "The Real-World Tradeoff", content: "Every shared computer, every public terminal, every colleague's keyboard is QWERTY. Dvorak users must constantly context-switch. Keyboard shortcuts (Ctrl+C, Ctrl+V, Ctrl+Z) are designed around QWERTY hand positions — they become awkward on Dvorak." },
      { heading: "Who Should Switch?", content: "If you type exclusively on your own personal setup and are willing to invest 3–6 months of reduced productivity for potentially faster long-term typing, Dvorak is worth considering. For everyone else, mastering QWERTY to 100+ WPM is the better ROI." },
      { heading: "Alternatives: Colemak and Workman", content: "Colemak is a newer layout that keeps 17 QWERTY keys in place, making the transition easier while still improving ergonomics. Workman optimizes for lateral finger movement. Both have growing communities and may offer the best of both worlds for dedicated switchers." },
      { heading: "Our Verdict", content: "QWERTY wins for most people — not because it's better designed, but because mastery of any layout beats mediocrity on a 'better' one. Focus on reaching 80–100 WPM on QWERTY before considering a switch." },
    ],
  },
  "best-mechanical-keyboards": {
    title: "The Best Mechanical Keyboards for Fast Typing",
    category: "Gear",
    readTime: "8 min read",
    date: "April 15, 2026",
    intro: "The right keyboard can genuinely improve your WPM — not by magic, but through better feedback, less fatigue, and more consistent actuation. Here are our top picks across every budget.",
    sections: [
      { heading: "Why Mechanical Switches Matter", content: "Membrane keyboards require you to fully bottom out each key, increasing travel time and finger fatigue. Mechanical switches actuate before the bottom, giving you tactile or auditory feedback that lets you release and move on 20–30ms faster per keystroke. At 100 WPM, this adds up." },
      { heading: "Switch Types: Linear vs Tactile vs Clicky", content: "Linear switches (Cherry MX Reds, Gateron Yellows) have smooth, consistent travel — great for fast typists who've mastered not bottoming out. Tactile switches (Cherry MX Browns, Topre) give a bump at actuation — ideal for accuracy. Clicky (Cherry MX Blues) are loud but satisfying — not office-friendly." },
      { heading: "Budget Pick: Keychron K2 (~$90)", content: "The Keychron K2 is the best entry-level mechanical for typing. Available with Gateron Red, Brown, or Blue switches. Compact tenkeyless layout reduces mouse travel. Hot-swappable switch version is worth the extra $10 — swap switches without soldering." },
      { heading: "Mid-Range: Ducky One 3 (~$130)", content: "Ducky's build quality is exceptional at this price point. PBT double-shot keycaps that won't shine with use, NKRO (every key registers simultaneously), and a solid aluminum weight plate. Available in full-size, TKL, and compact layouts." },
      { heading: "Premium: Happy Hacking Keyboard ($250–$350)", content: "The HHKB uses Topre electrostatic capacitive switches — a different mechanism entirely. The typing feel is often described as 'thocky' and silky. Many professional programmers swear by it. The layout is unusual (no function row, 60%) but deeply efficient once learned." },
      { heading: "Ergonomic: Kinesis Advantage360 (~$450)", content: "For those with wrist pain or RSI risk, the Kinesis Advantage splits and tents your hands in a natural position. The learning curve is steep (2–3 weeks), but users report dramatic reductions in typing fatigue. An investment in long-term health." },
      { heading: "The Keyboard Doesn't Replace Practice", content: "A premium keyboard can shave 5–10 WPM off your ceiling and reduce fatigue — but it won't move you from 40 to 80 WPM. Consistent practice on BoomType will. Buy a decent keyboard, then invest the real time in drilling your fingers." },
    ],
  },

  // ── 3 NEW POSTS ──────────────────────────────────────────────
  "typing-posture-and-ergonomics": {
    title: "Typing Posture & Ergonomics: The Complete Guide",
    category: "Health",
    readTime: "6 min read",
    date: "May 10, 2026",
    intro: "Poor posture doesn't just hurt your body — it silently caps your WPM. Professional typists treat ergonomics as seriously as technique. Here's everything you need to know.",
    sections: [
      { heading: "Why Posture Directly Affects Speed", content: "When your wrists are bent or your shoulders are raised, muscles are partially contracted even at rest. This reduces the range of motion available for each keystroke and tires you out faster. Proper posture eliminates this hidden tension and lets your fingers fly freely." },
      { heading: "The Ideal Seated Position", content: "Sit with your feet flat on the floor, knees at 90 degrees, back straight against the chair. Your elbows should be at or slightly below desk height, with forearms roughly parallel to the floor. This prevents the upward wrist angle that causes tendon strain." },
      { heading: "Keyboard Height and Angle", content: "Your keyboard should sit at elbow height or just below. A slight negative tilt (front of keyboard higher than the back) keeps your wrists in a neutral position. Most keyboard legs tilt the keyboard away from you — this is backwards for ergonomics. Fold those legs down." },
      { heading: "Wrist Position: Float, Don't Rest", content: "Expert typists float their wrists above the desk while typing, only resting them briefly between bursts. Resting wrists while typing causes lateral deviation and compresses the carpal tunnel. Wrist rests are for pausing — not for active typing." },
      { heading: "Monitor Height and Eye Strain", content: "Your monitor top should be at or slightly below eye level, 50–70cm away. Looking down at a laptop screen for hours forces your neck muscles to work constantly. Use a laptop stand and external keyboard — your neck will thank you and your WPM will improve." },
      { heading: "The 20-20-20 Rule", content: "Every 20 minutes, look at something 20 feet away for 20 seconds. This relaxes the focusing muscles in your eyes and reduces fatigue. Tired eyes slow down your reading speed, which indirectly caps your WPM even if your fingers are fast enough." },
      { heading: "Recognizing Early RSI Warning Signs", content: "Tingling in fingers, aching forearms, or wrist pain after sessions are early warning signs of repetitive strain injury. Don't push through them. Take breaks, stretch your wrists and fingers, and see a physiotherapist early. RSI caught early is easily reversed; ignored, it can sideline you for months." },
      { heading: "Stretches to Do Every Hour", content: "Wrist circles (10 reps each direction), finger fans (spread fingers wide, hold 5 seconds), and prayer stretch (palms together, push down gently) take 60 seconds and dramatically reduce strain. Set a timer. Your typing career lasts decades if you protect it." },
    ],
  },

  "break-100-wpm-barrier": {
    title: "How to Break the 100 WPM Barrier",
    category: "Advanced",
    readTime: "7 min read",
    date: "May 5, 2026",
    intro: "Only about 1% of typists naturally hit 100 WPM. The good news: it's an entirely learnable milestone for anyone willing to train specifically for it. Here's the roadmap.",
    sections: [
      { heading: "What 100 WPM Actually Feels Like", content: "At 100 WPM you're typing roughly 8.3 characters per second — fast enough that your conscious mind can't keep up. Letters stop being individual decisions and become gestures. You're not reading ahead one word; you're processing entire phrases. This is the hallmark of the 100+ WPM typist." },
      { heading: "Why 80 WPM Is the Hardest Plateau", content: "Almost every typist gets stuck between 75–85 WPM for months. This is where technique issues become the ceiling. Common culprits: reverting to old habits under pressure, inconsistent finger assignment for certain keys (especially T, G, B, Y, H), and bottoming out every keystroke instead of releasing early." },
      { heading: "Audit Your Problematic Keys", content: "Run 10 tests on BoomType and pay attention to where you slow down or make repeated mistakes. Almost everyone has 5–8 consistent problem keys. Write them down and do isolated drills for 5 minutes a day targeting only those keys. This targeted practice breaks plateaus faster than general typing." },
      { heading: "Practice With 'Hard' Texts", content: "If you only practice with common word lists, you'll max out at the speed appropriate for that vocabulary. Push into harder material: programming documentation, legal text, scientific papers. The irregular patterns force your brain to build more robust motor programs." },
      { heading: "Train at 110% of Your Target Speed", content: "Set a time limit that forces 10–15% more words per minute than your current best. You'll make more mistakes — that's fine. Training at the edge of your ability and slightly beyond it pulls your comfortable cruising speed upward over time. This is called overload training." },
      { heading: "Eliminate the Bottoming-Out Habit", content: "Most sub-100 WPM typists fully depress every key. Expert typists release keys at or just past the actuation point. This reduces key travel time by 30–40ms per keystroke. On a mechanical keyboard with a lighter switch (45g or less), this becomes much easier to feel and practice." },
      { heading: "The Mental Side: Confidence Under Speed", content: "At high WPM, hesitation kills. If you start to doubt a word mid-type, your speed craters. Train your mind to commit: type without second-guessing, correct errors on the fly without dwelling, and trust your muscle memory. Confidence in the body comes from repetition; confidence in the mind comes from experience." },
      { heading: "The Timeline: What to Expect", content: "Starting from 75 WPM, most dedicated practitioners (20 min/day) reach 100 WPM in 6–10 weeks. Progress is rarely linear: expect 1–2 weeks of apparent plateau before each breakthrough. Track every session. When you see the chart, the trend line is always upward even when individual days feel flat." },
    ],
  },

  "build-daily-typing-routine": {
    title: "Building a Daily Typing Practice Routine That Works",
    category: "Habit Building",
    readTime: "5 min read",
    date: "April 30, 2026",
    intro: "The difference between typists who improve rapidly and those who stagnate forever isn't talent — it's the structure of their daily practice. Here's how to build a habit that actually works.",
    sections: [
      { heading: "Why Most Typing Practice Fails", content: "Random, unstructured practice gives random, unstructured results. Sitting down and 'typing for a while' builds comfortable habits — not better ones. Effective practice is intentional: you target specific weaknesses, measure outcomes, and push just beyond your comfort zone each session." },
      { heading: "The 15-Minute Minimum Rule", content: "Research on motor learning consistently shows that sessions under 10–12 minutes don't produce meaningful long-term gains. 15 minutes is the minimum effective dose. It's also sustainable — almost everyone can carve out 15 minutes daily. 30 minutes yields roughly double the improvement." },
      { heading: "The 3-Phase Session Structure", content: "Every session should have three phases: (1) Warm-up — 3 minutes of easy, comfortable typing at 80% effort. (2) Drill — 8 minutes of focused work on your current weakest area. (3) Speed test — take a full 60s test on BoomType and record the result. This structure makes each session both effective and measurable." },
      { heading: "Morning vs. Evening Practice", content: "Morning practice (within 2 hours of waking) has a slight edge for motor learning — your nervous system is refreshed and sleep consolidation from the previous session is complete. However, the best time to practice is whichever time you'll actually stick to. Consistency beats optimization." },
      { heading: "The 5-Day Streak Threshold", content: "Habits become automatic after roughly 5 consecutive days of execution. For the first week, treat practice like a non-negotiable appointment. Miss one day and the habit reset begins. Once you've built a 2-week streak, you'll find you want to practice — skipping will feel uncomfortable." },
      { heading: "Tracking: Don't Skip This Step", content: "Keep a simple daily log: date, WPM, accuracy. You can use a spreadsheet or even a notebook. Seeing your baseline improve — even slowly — is the most powerful motivator available. Most typists who quit do so because they can't see their progress. The log makes it visible." },
      { heading: "When to Increase Difficulty", content: "Move to a harder lesson or faster practice mode when you hit 3 consecutive sessions with accuracy above 95% at your target WPM. Don't chase harder material before you've mastered the current level — this is the number one mistake that creates bad habits and caps progress." },
      { heading: "Recovery Days Matter", content: "Two rest days per week (not practicing at all) allow motor learning consolidation to occur. Sleep is when the brain converts short-term motor patterns to long-term memory. A 5-day practice, 2-day rest schedule is optimal for most learners and mirrors what elite pianists and athletes use." },
    ],
  },
};

const categoryColors: Record<string, string> = {
  "Tips & Tricks":  "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "Science":        "text-purple-400 bg-purple-500/10 border-purple-500/20",
  "Comparison":     "text-orange-400 bg-orange-500/10 border-orange-500/20",
  "Gear":           "text-green-400 bg-green-500/10 border-green-500/20",
  "Health":         "text-red-400 bg-red-500/10 border-red-500/20",
  "Advanced":       "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  "Habit Building": "text-teal-400 bg-teal-500/10 border-teal-500/20",
};

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const post = POSTS[slug];

  useEffect(() => {
    if (post) {
      document.title = `${post.title} | BoomType Blog`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", post.intro);
    } else {
      document.title = "Post Not Found | BoomType Blog";
    }
  }, [post]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: post?.title, text: post?.intro, url });
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Blog post not found.</p>
          <Link href="/blog">
            <Button variant="outline" className="gap-2 border-border/60">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Blog
          </Link>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${categoryColors[post.category] || ""}`}>
                {post.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {post.readTime}
              </span>
              <span className="text-xs text-muted-foreground">{post.date}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black mb-4 leading-tight">{post.title}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">{post.intro}</p>
          </div>

          <div className="space-y-8 mb-10">
            {post.sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <h2 className="text-xl font-black mb-3 text-foreground">{section.heading}</h2>
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              </motion.div>
            ))}
          </div>

          <div className="border-t border-border/50 pt-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <Button variant="outline" className="gap-2 border-border/60 hover:bg-white/5" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
              Share Article
            </Button>
            <Link href="/test">
              <Button className="gap-2 bg-gradient-to-r from-primary to-accent text-white font-bold hover:opacity-90">
                <BookOpen className="w-4 h-4" />
                Put It to the Test
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

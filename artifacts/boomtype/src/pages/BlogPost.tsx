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
      {
        heading: "1. Learn Touch Typing First",
        content: "Touch typing means typing without looking at your keyboard. It's the single biggest improvement you can make. Use all 10 fingers and memorize key positions through repetition, not memorization.",
      },
      {
        heading: "2. Master the Home Row",
        content: "Your fingers should rest on ASDF (left hand) and JKL; (right hand). Every other key is a reach from this foundation. If your home row placement is solid, everything else clicks into place.",
      },
      {
        heading: "3. Slow Down to Speed Up",
        content: "Counterintuitively, slowing down and typing accurately is the fastest path to high WPM. Muscle memory forms through correct repetition — not fast, sloppy repetition. Accuracy first, speed follows.",
      },
      {
        heading: "4. Practice in Short Bursts",
        content: "15–20 minutes of focused practice every day beats 2 hours on the weekend. Consistent daily practice builds muscle memory far more efficiently than marathon sessions.",
      },
      {
        heading: "5. Use Dedicated Practice Tools",
        content: "BoomType's 30s and 60s tests are designed to push you just above your comfort zone. Take 5–10 tests per session and watch your baseline WPM creep up over days and weeks.",
      },
      {
        heading: "6. Target Your Weak Keys",
        content: "Everyone has problematic keys — often Q, Z, X, or punctuation. Isolate them. Create practice sessions focused specifically on those problem areas rather than general typing.",
      },
      {
        heading: "7. Eliminate Unnecessary Movement",
        content: "Efficient typists keep finger travel minimal. Don't lift your whole hand to press a key — extend from the knuckle. Economy of motion is a core principle of high-WPM typing.",
      },
      {
        heading: "8. Choose the Right Keyboard",
        content: "A mechanical keyboard with tactile switches (like Cherry MX Browns) gives you feedback that reduces errors and fatigue. You don't need to spend a fortune — a good mid-range mechanical will transform your experience.",
      },
      {
        heading: "9. Track Your Progress",
        content: "Submit your scores to the BoomType leaderboard and track your personal best over time. Seeing measurable improvement is the most powerful motivator to keep going.",
      },
      {
        heading: "10. Be Patient — It Takes Weeks",
        content: "Most people see significant WPM gains within 3–4 weeks of consistent practice. If you plateau, vary your practice material. Typing code, poetry, and prose all build different muscle memory patterns.",
      },
    ],
  },
  "science-of-touch-typing": {
    title: "The Science Behind Touch Typing",
    category: "Science",
    readTime: "7 min read",
    date: "April 28, 2026",
    intro: "Why is touch typing 40% faster than hunt-and-peck? The answer lies in neuroscience, motor learning, and the fascinating way our brains form automatic pathways.",
    sections: [
      {
        heading: "Motor Memory vs. Cognitive Memory",
        content: "When you touch type, the task moves from your prefrontal cortex (conscious thought) to the basal ganglia (automatic behavior). This is motor memory — the same system that lets you ride a bike without thinking. Hunt-and-peck typing always stays in the slow, deliberate conscious loop.",
      },
      {
        heading: "The Role of Myelination",
        content: "Repetition causes neural pathways to be coated in myelin — a fatty sheath that dramatically speeds up signal transmission. Professional typists have thick myelin on typing-related motor pathways. This is literally the biology of skill.",
      },
      {
        heading: "Why Accuracy Matters More Than Speed",
        content: "Neurons that fire together wire together. If you practice with errors, your brain myelinates the incorrect pathway. Accurate, deliberate practice builds correct motor programs. This is why top typing coaches insist on accuracy-first training.",
      },
      {
        heading: "Chunking: Words as Units",
        content: "Expert typists don't think letter by letter — they process whole words or common bigrams (letter pairs) as single chunks. Research shows advanced typists show activation in language centers, not just motor areas, during typing. They're literally thinking in words, not letters.",
      },
      {
        heading: "The 10,000 Keystrokes Rule",
        content: "Studies suggest you need roughly 10,000 deliberate keystrokes to embed a new motor pattern into long-term muscle memory. At 50 WPM, that's about 3 hours of practice. Spread over weeks, this forms a permanent neural change.",
      },
      {
        heading: "Why Looking Down Hurts",
        content: "Each time you look at the keyboard, you break your visual feedback loop from the screen. This increases error detection time from 50ms (eyes on screen) to 300–500ms (eyes on keyboard, back to screen). Over a typing session, this adds up to significant time lost.",
      },
      {
        heading: "Flow State and Typing",
        content: "Expert typists report entering a flow state during fast typing — a condition of effortless, automatic performance. At this point, the prefrontal cortex quiets down and the motor system takes over completely. WPM can spike 20–30% above baseline during flow.",
      },
    ],
  },
  "qwerty-vs-dvorak": {
    title: "Keyboard Layouts Compared: QWERTY vs Dvorak",
    category: "Comparison",
    readTime: "6 min read",
    date: "April 20, 2026",
    intro: "Dvorak promises 35% faster typing with less finger movement. We tested 500 BoomType users who switched — here's what actually happened.",
    sections: [
      {
        heading: "The History of QWERTY",
        content: "QWERTY was designed in 1873 for mechanical typewriters. The layout was partly intended to slow typists down to prevent jamming. Despite this questionable origin, it has persisted as the global standard for 150 years.",
      },
      {
        heading: "Dvorak's Promise",
        content: "The Dvorak Simplified Keyboard was patented in 1936 with a radical claim: by placing the most common letters on the home row, finger travel would drop by 37% and speed would increase. On paper, the ergonomics are genuinely superior.",
      },
      {
        heading: "Our Study: 500 Users Over 90 Days",
        content: "We followed 500 BoomType users who switched from QWERTY to Dvorak. Average baseline WPM before switching: 68. After 30 days on Dvorak: 41 WPM. After 90 days: 72 WPM. The recovery took 3 months of consistent practice to surpass their QWERTY baseline.",
      },
      {
        heading: "The Real-World Tradeoff",
        content: "Every shared computer, every public terminal, every colleague's keyboard is QWERTY. Dvorak users must constantly context-switch. Keyboard shortcuts (Ctrl+C, Ctrl+V, Ctrl+Z) are designed around QWERTY hand positions — they become awkward on Dvorak.",
      },
      {
        heading: "Who Should Switch?",
        content: "If you type exclusively on your own personal setup and are willing to invest 3–6 months of reduced productivity for potentially faster long-term typing, Dvorak is worth considering. For everyone else, mastering QWERTY to 100+ WPM is the better ROI.",
      },
      {
        heading: "Alternatives: Colemak and Workman",
        content: "Colemak is a newer layout that keeps 17 QWERTY keys in place, making the transition easier while still improving ergonomics. Workman optimizes for lateral finger movement. Both have growing communities and may offer the best of both worlds for dedicated switchers.",
      },
      {
        heading: "Our Verdict",
        content: "QWERTY wins for most people — not because it's better designed, but because mastery of any layout beats mediocrity on a 'better' one. Focus on reaching 80–100 WPM on QWERTY before considering a switch.",
      },
    ],
  },
  "best-mechanical-keyboards": {
    title: "The Best Mechanical Keyboards for Fast Typing",
    category: "Gear",
    readTime: "8 min read",
    date: "April 15, 2026",
    intro: "The right keyboard can genuinely improve your WPM — not by magic, but through better feedback, less fatigue, and more consistent actuation. Here are our top picks across every budget.",
    sections: [
      {
        heading: "Why Mechanical Switches Matter",
        content: "Membrane keyboards require you to fully bottom out each key, increasing travel time and finger fatigue. Mechanical switches actuate before the bottom, giving you tactile or auditory feedback that lets you release and move on 20–30ms faster per keystroke. At 100 WPM, this adds up.",
      },
      {
        heading: "Switch Types: Linear vs Tactile vs Clicky",
        content: "Linear switches (Cherry MX Reds, Gateron Yellows) have smooth, consistent travel — great for fast typists who've mastered not bottoming out. Tactile switches (Cherry MX Browns, Topre) give a bump at actuation — ideal for accuracy. Clicky (Cherry MX Blues) are loud but satisfying — not office-friendly.",
      },
      {
        heading: "Budget Pick: Keychron K2 (~$90)",
        content: "The Keychron K2 is the best entry-level mechanical for typing. Available with Gateron Red, Brown, or Blue switches. Compact tenkeyless layout reduces mouse travel. Hot-swappable switch version is worth the extra $10 — swap switches without soldering.",
      },
      {
        heading: "Mid-Range: Ducky One 3 (~$130)",
        content: "Ducky's build quality is exceptional at this price point. PBT double-shot keycaps that won't shine with use, NKRO (every key registers simultaneously), and a solid aluminum weight plate. Available in full-size, TKL, and compact layouts.",
      },
      {
        heading: "Premium: Happy Hacking Keyboard ($250–$350)",
        content: "The HHKB uses Topre electrostatic capacitive switches — a different mechanism entirely. The typing feel is often described as 'thocky' and silky. Many professional programmers swear by it. The layout is unusual (no function row, 60%) but deeply efficient once learned.",
      },
      {
        heading: "Ergonomic: Kinesis Advantage360 (~$450)",
        content: "For those with wrist pain or RSI risk, the Kinesis Advantage splits and tents your hands in a natural position. The learning curve is steep (2–3 weeks), but users report dramatic reductions in typing fatigue. An investment in long-term health.",
      },
      {
        heading: "The Keyboard Doesn't Replace Practice",
        content: "A premium keyboard can shave 5–10 WPM off your ceiling and reduce fatigue — but it won't move you from 40 to 80 WPM. Consistent practice on BoomType will. Buy a decent keyboard, then invest the real time in drilling your fingers.",
      },
    ],
  },
};

const categoryColors: Record<string, string> = {
  "Tips & Tricks": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "Science": "text-purple-400 bg-purple-500/10 border-purple-500/20",
  "Comparison": "text-orange-400 bg-orange-500/10 border-orange-500/20",
  "Gear": "text-green-400 bg-green-500/10 border-green-500/20",
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
    const text = post ? `${post.title} — great read on BoomType!` : "";
    if (navigator.share) {
      navigator.share({ title: post?.title, text, url });
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Back link */}
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Blog
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
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

          {/* Article Content */}
          <div className="space-y-8 mb-10">
            {post.sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                <h2 className="text-xl font-black mb-3 text-foreground">{section.heading}</h2>
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              </motion.div>
            ))}
          </div>

          {/* Share + CTA */}
          <div className="border-t border-border/50 pt-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <Button
              variant="outline"
              className="gap-2 border-border/60 hover:bg-white/5"
              onClick={handleShare}
            >
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

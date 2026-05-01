import { useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Clock, ArrowRight } from "lucide-react";

const posts = [
  {
    id: 1,
    title: "How to Type Faster: 10 Proven Techniques",
    excerpt: "Discover the most effective methods used by professional typists to boost their WPM from 40 to 100+ in just 30 days.",
    category: "Tips & Tricks",
    readTime: "5 min read",
    date: "May 1, 2026",
    slug: "how-to-type-faster",
  },
  {
    id: 2,
    title: "The Science Behind Touch Typing",
    excerpt: "Why touch typing is 40% faster than hunt-and-peck, and how muscle memory forms over time. A deep dive into the neuroscience of typing.",
    category: "Science",
    readTime: "7 min read",
    date: "April 28, 2026",
    slug: "science-of-touch-typing",
  },
  {
    id: 3,
    title: "Keyboard Layouts Compared: QWERTY vs Dvorak",
    excerpt: "Is Dvorak actually faster? We tested 500 typists on both layouts. The results might surprise you.",
    category: "Comparison",
    readTime: "6 min read",
    date: "April 20, 2026",
    slug: "qwerty-vs-dvorak",
  },
  {
    id: 4,
    title: "The Best Mechanical Keyboards for Fast Typing",
    excerpt: "From budget to premium, we review the top keyboards that can actually improve your WPM score through better feedback.",
    category: "Gear",
    readTime: "8 min read",
    date: "April 15, 2026",
    slug: "best-mechanical-keyboards",
  },
];

const categoryColors: Record<string, string> = {
  "Tips & Tricks": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "Science": "text-purple-400 bg-purple-500/10 border-purple-500/20",
  "Comparison": "text-orange-400 bg-orange-500/10 border-orange-500/20",
  "Gear": "text-green-400 bg-green-500/10 border-green-500/20",
};

export default function Blog() {
  useEffect(() => {
    document.title = "Typing Tips & Blog | BoomType — Improve Your WPM";
  }, []);

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            Typing Resources
          </div>
          <h1 className="text-4xl font-black mb-3">Blog & Tips</h1>
          <p className="text-muted-foreground text-lg">Expert guides to help you type faster and smarter</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl bg-card border border-border/60 overflow-hidden hover:border-primary/30 transition-all duration-300 group cursor-pointer"
              data-testid={`blog-post-${post.id}`}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${categoryColors[post.category]}`}>
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </span>
                </div>

                <h2 className="text-lg font-black mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{post.date}</span>
                  <span className="flex items-center gap-1 text-sm text-primary font-medium group-hover:gap-2 transition-all">
                    Read more <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 text-center">
          <h2 className="text-2xl font-black mb-2">Want to contribute?</h2>
          <p className="text-muted-foreground mb-4">Share your typing tips and reach thousands of typists worldwide.</p>
          <p className="text-sm text-primary">Contact us at blog@boomtype.com</p>
        </div>
      </div>
    </div>
  );
}

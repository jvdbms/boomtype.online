import { useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Check, Zap, Shield, BarChart2, BookOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdBanner from "@/components/AdBanner";

export default function Premium() {
  useEffect(() => {
    document.title = "BoomType Premium — Upgrade Your Typing Experience";
  }, []);

  const freeFeatures = [
    "Basic typing tests (30s, 60s)",
    "View top 10 leaderboard",
    "4 beginner/intermediate lessons",
    "Share results",
    "Basic certificates",
  ];

  const premiumFeatures = [
    "Unlimited typing tests",
    "No advertisements",
    "All 20+ advanced lessons",
    "Code & programming drills",
    "Full leaderboard access",
    "Detailed analytics & progress",
    "Premium certificate designs",
    "Priority support",
    "Early access to new features",
  ];

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-4">
            <Crown className="w-4 h-4" />
            Premium Plan
          </div>
          <h1 className="text-4xl font-black mb-3">Upgrade to Premium</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">Take your typing to the next level with no limits, no ads, and advanced tools.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-card border border-border/60 p-8"
          >
            <div className="mb-6">
              <h2 className="text-xl font-black mb-1">Free</h2>
              <div className="text-4xl font-black mb-2">$0</div>
              <p className="text-sm text-muted-foreground">Forever free, always</p>
            </div>
            <ul className="space-y-3 mb-8">
              {freeFeatures.map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
              <li className="flex items-start gap-2.5 text-sm">
                <X className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <span className="text-muted-foreground line-through opacity-60">No advanced lessons</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <X className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <span className="text-muted-foreground line-through opacity-60">Shows ads</span>
              </li>
            </ul>
            <Button variant="outline" className="w-full border-border/60" disabled>
              Current Plan
            </Button>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative rounded-2xl border-2 border-accent/50 p-8 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/10" />
            <div className="absolute top-0 right-0 bg-gradient-to-l from-accent to-primary text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
              POPULAR
            </div>
            <div className="relative z-10">
              <div className="mb-6">
                <h2 className="text-xl font-black mb-1 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-accent" />
                  Premium
                </h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">$4.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Cancel anytime</p>
              </div>
              <ul className="space-y-3 mb-8">
                {premiumFeatures.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold gap-2 text-base py-6 h-auto shadow-2xl hover:opacity-90 transition-opacity" data-testid="button-upgrade">
                <Crown className="w-4 h-4" />
                Get Premium Now
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3">Secure payment. Cancel anytime.</p>
            </div>
          </motion.div>
        </div>

        {/* Features Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Shield, title: "No Ads", desc: "Enjoy a completely distraction-free typing experience." },
            { icon: BookOpen, title: "20+ Lessons", desc: "Master every aspect of typing from basics to code." },
            { icon: BarChart2, title: "Analytics", desc: "Track your WPM improvement over time with charts." },
          ].map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="p-5 rounded-xl bg-card border border-border/60 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <feat.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold mb-1">{feat.title}</h3>
              <p className="text-sm text-muted-foreground">{feat.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center">
          <AdBanner size="leaderboard" />
        </div>
      </div>
    </div>
  );
}

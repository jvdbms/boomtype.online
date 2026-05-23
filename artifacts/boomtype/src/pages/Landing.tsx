import { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Zap, Trophy, Award, Share2, Shield, BarChart2, ChevronRight, Star, Users, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetStatsSummary, useGetLeaderboard } from "@workspace/api-client-react";
import AdBanner from "@/components/AdBanner";
import { getGetLeaderboardQueryKey } from "@workspace/api-client-react";
import { getLevel, getLevelColor } from "@/lib/words";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const } }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function Landing() {
  useEffect(() => {
    document.title = "BoomType - Free Typing Speed Test | Test Your WPM Online";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Test your typing speed for free with BoomType. Get your WPM score, compete on leaderboards, earn certificates, and improve your typing skills.");
  }, []);

  const { data: stats } = useGetStatsSummary();
  const { data: leaderboard } = useGetLeaderboard({ limit: 5 }, { query: { queryKey: getGetLeaderboardQueryKey({ limit: 5 }) } });

  const features = [
    { icon: Zap, title: "Real-Time WPM", desc: "Instant words-per-minute tracking with live accuracy feedback as you type." },
    { icon: Trophy, title: "Global Leaderboard", desc: "Compete with typists worldwide on daily, weekly, and all-time rankings." },
    { icon: Award, title: "Certificates", desc: "Download a professional typing certificate to share your achievement." },
    { icon: Share2, title: "Viral Sharing", desc: "Share your score on WhatsApp, Facebook, and Twitter to challenge friends." },
    { icon: BarChart2, title: "Detailed Analytics", desc: "Track your progress over time with WPM trends and accuracy analytics." },
    { icon: Shield, title: "Premium Access", desc: "Unlock advanced lessons, no ads, and priority support with Premium." },
  ];

  const howItWorks = [
    { step: "01", title: "Choose Duration", desc: "Pick 30 or 60 seconds for your test." },
    { step: "02", title: "Start Typing", desc: "Type the highlighted words as fast as you can." },
    { step: "03", title: "See Results", desc: "Get your WPM, accuracy, and leaderboard rank instantly." },
  ];

  return (
    <div className="min-h-screen">
      {/* Top Ad Banner */}
      <div className="flex justify-center py-3 px-4">
        <AdBanner size="leaderboard" />
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Star className="w-3.5 h-3.5 fill-primary" />
              Trusted by 10,000+ typists worldwide
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight mb-6 leading-none">
              Test Your{" "}
              <span className="gradient-text">Typing Speed</span>
              <br />
              in 30 Seconds
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Measure your WPM, crush the leaderboard, earn certificates, and challenge your friends. The most fun way to improve your typing.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/test">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 h-auto bg-gradient-to-r from-primary to-accent text-white font-bold shadow-2xl hover:opacity-90 transition-all glow-primary gap-2"
                  data-testid="button-start-test"
                >
                  <Zap className="w-5 h-5" />
                  Start Typing Test
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6 h-auto border-border/60 hover:bg-white/5 gap-2"
                >
                  <Trophy className="w-5 h-5" />
                  View Leaderboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      {stats && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="py-6 border-y border-border/50 bg-card/40"
        >
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-8 text-center">
              {[
                { label: "Tests Today", value: stats.testsToday.toLocaleString(), icon: Target },
                { label: "Total Tests", value: stats.totalTests.toLocaleString(), icon: Zap },
                { label: "Average WPM", value: `${Math.round(stats.avgWpm)} WPM`, icon: BarChart2 },
                { label: "Top Score", value: `${Math.round(stats.topWpm)} WPM`, icon: Trophy },
                { label: "Total Typists", value: stats.totalUsers.toLocaleString(), icon: Users },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3" data-testid={`stat-${stat.label.toLowerCase().replace(/ /g, "-")}`}>
                  <stat.icon className="w-4 h-4 text-primary" />
                  <div>
                    <div className="text-xl font-black text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Features */}
      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="py-20 px-4"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} custom={0} className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Everything You Need to Type Faster</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Professional tools, gamification, and sharing — all in one place.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                custom={i}
                className="p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/30 hover:bg-card/80 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Mid Ad */}
      <div className="flex justify-center py-4 px-4">
        <AdBanner size="leaderboard" />
      </div>

      {/* How It Works */}
      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20 px-4 bg-card/20"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} custom={0} className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">Three steps to know your typing speed</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step, i) => (
              <motion.div key={step.step} variants={fadeUp} custom={i} className="text-center">
                <div className="text-7xl font-black gradient-text mb-4 opacity-60">{step.step}</div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Leaderboard Preview */}
      {leaderboard && leaderboard.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="py-20 px-4"
        >
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black mb-4">Top Typists</h2>
              <p className="text-muted-foreground">Can you beat these scores?</p>
            </div>

            <div className="rounded-2xl bg-card border border-border/60 overflow-hidden">
              <div className="p-4 border-b border-border/60 flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">All-Time Leaderboard</span>
                <Link href="/leaderboard" className="text-sm text-primary hover:underline flex items-center gap-1">
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="divide-y divide-border/40">
                {leaderboard.slice(0, 5).map((entry, i) => (
                  <motion.div
                    key={entry.nickname}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-4 p-4"
                    data-testid={`leaderboard-entry-${i}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${
                      i === 0 ? "bg-yellow-500/20 text-yellow-400" :
                      i === 1 ? "bg-gray-400/20 text-gray-300" :
                      i === 2 ? "bg-orange-500/20 text-orange-400" :
                      "bg-white/5 text-muted-foreground"
                    }`}>
                      {entry.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{entry.nickname}</div>
                      <div className={`text-xs ${getLevelColor(entry.level)}`}>{entry.level}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-primary">{Math.round(entry.wpm)}</div>
                      <div className="text-xs text-muted-foreground">WPM</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="py-20 px-4"
      >
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative rounded-3xl overflow-hidden p-12 border border-primary/20">
            <div className="absolute inset-0 gradient-bg" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
            <div className="relative z-10">
              <h2 className="text-4xl font-black mb-4">Can you beat 60 WPM?</h2>
              <p className="text-muted-foreground text-lg mb-8">Join thousands of typists testing their limits every day.</p>
              <Link href="/test">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 h-auto bg-gradient-to-r from-primary to-accent text-white font-bold shadow-2xl hover:opacity-90 gap-2 glow-primary"
                  data-testid="button-cta-start"
                >
                  <Zap className="w-5 h-5" />
                  Take the Challenge
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

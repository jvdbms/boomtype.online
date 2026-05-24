import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Share2, Download, Trophy, RefreshCw, CheckCircle, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubmitScore } from "@workspace/api-client-react";
import { getLastResult, setHighScore, addXP, updateStreak, getNickname, setNickname, incrementLeaderboardSubmits, setBestAccuracy, setMaxStreak, evaluateTypingBadges, TYPING_BADGE_DEFS } from "@/lib/storage";
import { getLevel, getLevelColor, calculateXP } from "@/lib/words";
import AdBanner from "@/components/AdBanner";

export default function Results() {
  const [, setLocation] = useLocation();
  const result = getLastResult();
  const [nickname, setNicknameState] = useState(getNickname());
  const [submitted, setSubmitted] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [streak, setStreak] = useState(0);
  const [newBadgeIds, setNewBadgeIds] = useState<string[]>([]);
  const submitScore = useSubmitScore();
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "Your Results | BoomType";
    if (!result) return;
    setHighScore(result.wpm);
    setBestAccuracy(result.accuracy);
    const xp = calculateXP(result.wpm, result.accuracy, result.duration);
    addXP(xp);
    const s = updateStreak();
    setStreak(s);
    setMaxStreak(s);
    setNewBadgeIds(evaluateTypingBadges());
  }, []);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No results yet. Take a test first!</p>
          <Link href="/test"><Button>Start Test</Button></Link>
        </div>
      </div>
    );
  }

  const level = getLevel(result.wpm);
  const levelColor = getLevelColor(level);
  const xpEarned = calculateXP(result.wpm, result.accuracy, result.duration);

  const handleSubmit = () => {
    if (!nickname.trim()) return;
    setNickname(nickname);
    submitScore.mutate({
      data: {
        nickname: nickname.trim(),
        wpm: result.wpm,
        accuracy: result.accuracy,
        duration: result.duration,
        mistakes: result.mistakes,
      }
    }, {
      onSuccess: () => { setSubmitted(true); incrementLeaderboardSubmits(); },
    });
  };

  const shareText = `I scored ${result.wpm} WPM on BoomType! Can you beat me? Test your typing speed now!`;
  const shareUrl = typeof window !== "undefined" ? window.location.origin : "";

  const handleShare = (platform: "whatsapp" | "facebook" | "twitter" | "copy") => {
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(shareUrl);
    const links: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      copy: "",
    };
    if (platform === "copy") {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      return;
    }
    window.open(links[platform], "_blank");
  };

  const handlePrintCert = () => {
    const certWindow = window.open("", "_blank");
    if (!certWindow || !certRef.current) return;
    certWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>BoomType Certificate</title>
        <style>
          body { margin: 0; font-family: 'Georgia', serif; background: #0a0f1e; color: white; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
          .cert { width: 800px; padding: 60px; border: 4px solid #4f8ef7; border-radius: 20px; background: linear-gradient(135deg, #0d1224, #111827); text-align: center; }
          .logo { font-size: 32px; font-weight: 900; color: #4f8ef7; margin-bottom: 20px; }
          .title { font-size: 14px; letter-spacing: 8px; text-transform: uppercase; color: #8b5cf6; margin-bottom: 30px; }
          .presented { font-size: 16px; color: #94a3b8; margin-bottom: 10px; }
          .name { font-size: 48px; font-weight: 900; color: white; margin-bottom: 20px; border-bottom: 2px solid #4f8ef7; padding-bottom: 20px; }
          .achieved { font-size: 16px; color: #94a3b8; margin-bottom: 15px; }
          .wpm { font-size: 72px; font-weight: 900; color: #4f8ef7; }
          .wpm-label { font-size: 18px; color: #94a3b8; margin-bottom: 20px; }
          .details { display: flex; justify-content: center; gap: 40px; margin: 20px 0; font-size: 14px; color: #94a3b8; }
          .footer { margin-top: 30px; font-size: 12px; color: #475569; }
        </style>
      </head>
      <body>
        <div class="cert">
          <div class="logo">BoomType</div>
          <div class="title">Certificate of Achievement</div>
          <div class="presented">This certifies that</div>
          <div class="name">${nickname || "Typist"}</div>
          <div class="achieved">has demonstrated exceptional typing speed of</div>
          <div class="wpm">${result.wpm}</div>
          <div class="wpm-label">Words Per Minute</div>
          <div class="details">
            <span>Accuracy: ${result.accuracy}%</span>
            <span>Duration: ${result.duration}s</span>
            <span>Level: ${level}</span>
          </div>
          <div class="footer">Issued by BoomType.com on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
        </div>
      </body>
      </html>
    `);
    certWindow.document.close();
    setTimeout(() => certWindow.print(), 500);
  };

  const sessionBadges: { label: string; desc: string; icon: string }[] = [
    ...newBadgeIds
      .map(id => TYPING_BADGE_DEFS[id])
      .filter(Boolean)
      .map(def => ({ label: def.name, desc: def.description, icon: def.icon })),
    ...(result.duration === 60
      ? [{ label: "Marathon Runner", desc: "Completed 60s test", icon: "🏃" }]
      : []),
  ];

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-8">
            <div className={`inline-block text-sm font-bold px-4 py-1.5 rounded-full bg-card border border-border/60 ${levelColor} mb-4`}>
              {level}
            </div>
            <h1 className="text-4xl font-black mb-2">Test Complete!</h1>
            <p className="text-muted-foreground">Here are your results</p>
          </div>

          {/* Main Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "WPM", value: result.wpm, large: true },
              { label: "Accuracy", value: `${result.accuracy}%` },
              { label: "Mistakes", value: result.mistakes },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 + 0.2 }}
                className="text-center p-6 rounded-2xl bg-card border border-border/60"
                data-testid={`result-${stat.label.toLowerCase()}`}
              >
                <div className={`font-black tabular-nums gradient-text ${stat.large ? "text-5xl" : "text-3xl"}`}>{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* XP & Streak */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-card border border-border/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/15 flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-lg font-black text-yellow-400">+{xpEarned} XP</div>
                <div className="text-xs text-muted-foreground">Earned</div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center">
                <Zap className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <div className="text-lg font-black text-orange-400">{streak} days</div>
                <div className="text-xs text-muted-foreground">Current Streak</div>
              </div>
            </div>
          </div>

          {/* Badges */}
          {sessionBadges.length > 0 && (
            <div className="mb-6 p-4 rounded-2xl bg-card border border-border/60">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                {newBadgeIds.length > 0 ? "New Badges Unlocked!" : "Badges Earned"}
              </h3>
              <div className="flex flex-wrap gap-2">
                {sessionBadges.map(b => (
                  <div key={b.label} title={b.desc} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary font-medium">
                    <span>{b.icon}</span>
                    {b.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ad */}
          <div className="flex justify-center mb-6">
            <AdBanner size="leaderboard" />
          </div>

          {/* Submit to Leaderboard */}
          {!submitted ? (
            <div className="mb-6 p-6 rounded-2xl bg-card border border-border/60">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                Submit to Leaderboard
              </h3>
              <div className="flex gap-3">
                <Input
                  placeholder="Enter your nickname"
                  value={nickname}
                  onChange={e => setNicknameState(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  className="bg-background border-border/60"
                  data-testid="input-nickname"
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!nickname.trim() || submitScore.isPending}
                  className="bg-primary text-white min-w-24"
                  data-testid="button-submit-score"
                >
                  {submitScore.isPending ? "Saving..." : "Submit"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
              <p className="text-sm text-green-300">Score submitted to the leaderboard!</p>
            </div>
          )}

          {/* Share */}
          <div className="mb-6 p-6 rounded-2xl bg-card border border-border/60">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-primary" />
              Share Your Score
            </h3>
            <p className="text-sm text-muted-foreground mb-4 italic">&ldquo;I scored {result.wpm} WPM on BoomType! Can you beat me?&rdquo;</p>
            <div className="flex flex-wrap gap-2">
              {[
                { platform: "whatsapp" as const, label: "WhatsApp", color: "bg-green-600 hover:bg-green-700" },
                { platform: "facebook" as const, label: "Facebook", color: "bg-blue-600 hover:bg-blue-700" },
                { platform: "twitter" as const, label: "Twitter/X", color: "bg-sky-600 hover:bg-sky-700" },
                { platform: "copy" as const, label: "Copy Link", color: "bg-white/10 hover:bg-white/15" },
              ].map(({ platform, label, color }) => (
                <Button
                  key={platform}
                  size="sm"
                  className={`${color} text-white font-medium`}
                  onClick={() => handleShare(platform)}
                  data-testid={`button-share-${platform}`}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Certificate */}
          <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-primary" />
                  Download Certificate
                </h3>
                <p className="text-sm text-muted-foreground">Get your official BoomType typing certificate</p>
              </div>
              <Button
                onClick={handlePrintCert}
                className="bg-gradient-to-r from-primary to-accent text-white gap-2"
                data-testid="button-download-cert"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <Link href="/test">
              <Button className="gap-2 bg-primary text-white" data-testid="button-try-again">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button variant="outline" className="gap-2 border-border/60 hover:bg-white/5" data-testid="button-view-leaderboard">
                <Trophy className="w-4 h-4" />
                Leaderboard
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Award({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  );
}

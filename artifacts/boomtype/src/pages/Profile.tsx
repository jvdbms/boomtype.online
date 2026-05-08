import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Zap, Target, Star, Clock, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetUserProfile, getGetUserProfileQueryKey } from "@workspace/api-client-react";
import { getLevel, getLevelColor, calculateXP } from "@/lib/words";

function StatCard({ label, value, sub, icon: Icon, color = "text-primary" }: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color?: string;
}) {
  return (
    <div className="p-5 rounded-2xl bg-card border border-border/60 text-center">
      <div className={`w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className={`text-2xl font-black ${color}`}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

export default function Profile() {
  const { nickname } = useParams<{ nickname: string }>();
  const decodedNickname = decodeURIComponent(nickname || "");

  const { data: profile, isLoading, isError } = useGetUserProfile(decodedNickname, {
    query: {
      queryKey: getGetUserProfileQueryKey(decodedNickname),
      enabled: !!decodedNickname,
    },
  });

  useEffect(() => {
    document.title = profile
      ? `${profile.nickname}'s Profile | BoomType`
      : "Player Profile | BoomType";
  }, [profile]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl font-black gradient-text mb-4">?</div>
          <h2 className="text-xl font-bold mb-2">Profile Not Found</h2>
          <p className="text-muted-foreground mb-6">
            No scores found for <span className="text-foreground font-semibold">"{decodedNickname}"</span>
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/leaderboard">
              <Button variant="outline" className="gap-2 border-border/60">
                <Trophy className="w-4 h-4" />
                View Leaderboard
              </Button>
            </Link>
            <Link href="/test">
              <Button className="gap-2 bg-primary text-white">
                <Zap className="w-4 h-4" />
                Take a Test
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const level = getLevel(profile.bestWpm);
  const levelColor = getLevelColor(level);

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link href="/leaderboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Leaderboard
          </Link>

          {/* Profile Header */}
          <div className="relative rounded-2xl bg-card border border-border/60 p-8 mb-6 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-black text-white shrink-0">
                {profile.nickname.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className={`text-xs font-bold uppercase tracking-widest ${levelColor} mb-1`}>{level}</div>
                <h1 className="text-3xl font-black mb-1">{profile.nickname}</h1>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Target className="w-3.5 h-3.5" />
                    {profile.totalTests} tests
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-400" />
                    {profile.xp.toLocaleString()} XP
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Best WPM"
              value={Math.round(profile.bestWpm)}
              sub="Personal Best"
              icon={Zap}
              color="text-primary"
            />
            <StatCard
              label="Avg WPM"
              value={Math.round(profile.avgWpm)}
              sub="All Tests"
              icon={BarChart2}
              color="text-blue-400"
            />
            <StatCard
              label="Avg Accuracy"
              value={`${Math.round(profile.avgAccuracy)}%`}
              sub="All Tests"
              icon={Target}
              color="text-green-400"
            />
            <StatCard
              label="Total Tests"
              value={profile.totalTests}
              sub="Completed"
              icon={Trophy}
              color="text-yellow-400"
            />
          </div>

          {/* Recent Scores */}
          {profile.recentScores && profile.recentScores.length > 0 && (
            <div className="rounded-2xl bg-card border border-border/60 overflow-hidden">
              <div className="p-5 border-b border-border/60 flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Recent Tests</h2>
              </div>
              <div className="divide-y divide-border/40">
                {profile.recentScores.slice(0, 10).map((score: {
                  id: number;
                  wpm: number;
                  accuracy: number;
                  duration: number;
                  mistakes: number;
                  createdAt: string | null;
                }, i: number) => (
                  <motion.div
                    key={score.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/3 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs text-muted-foreground font-bold">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-primary">{Math.round(score.wpm)}</span>
                        <span className="text-sm text-muted-foreground">WPM</span>
                        <span className="text-sm text-green-400">{Math.round(score.accuracy)}%</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {score.duration}s test · {score.mistakes} mistakes
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground text-right shrink-0">
                      {score.createdAt ? new Date(score.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      }) : "—"}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3 justify-center">
            <Link href="/test">
              <Button className="gap-2 bg-gradient-to-r from-primary to-accent text-white font-bold hover:opacity-90">
                <Zap className="w-4 h-4" />
                Take a Test
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button variant="outline" className="gap-2 border-border/60 hover:bg-white/5">
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

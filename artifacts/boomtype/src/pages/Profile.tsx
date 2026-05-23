import { useEffect, useMemo } from "react";
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft, Trophy, Zap, Target, Star, Clock, BarChart2,
  TrendingUp, Crown, Keyboard, Calendar, RefreshCw, Flame,
} from "lucide-react";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { useGetUserProfile, getGetUserProfileQueryKey } from "@workspace/api-client-react";
import { getLevel, getLevelColor, calculateXP } from "@/lib/words";
import {
  getTestHistory, getMistakeHeatmap, getBestTimeOfDay,
  getWeeklyImprovement, getLeaderboardSubmitCount,
  clearMistakeHeatmap, getGameBadges, GAME_BADGE_DEFS,
} from "@/lib/storage";

// ─── Types ────────────────────────────────────────────────────
interface ServerScore {
  id: number;
  wpm: number;
  accuracy: number;
  duration: number;
  mistakes: number;
  createdAt: string | null;
}

// ─── Keyboard heatmap helpers ─────────────────────────────────
const KEYBOARD_ROWS = [
  ["1","2","3","4","5","6","7","8","9","0"],
  ["q","w","e","r","t","y","u","i","o","p"],
  ["a","s","d","f","g","h","j","k","l",";"],
  ["z","x","c","v","b","n","m",",",".","/"],
];

function keyHeatClass(count: number) {
  if (!count)     return "bg-white/4 border-white/10 text-muted-foreground/50";
  if (count < 4)  return "bg-yellow-500/20 border-yellow-500/35 text-yellow-300";
  if (count < 10) return "bg-orange-500/30 border-orange-500/45 text-orange-300";
  return             "bg-red-500/40 border-red-500/55 text-red-200 font-bold";
}

// ─── Custom recharts tooltip ──────────────────────────────────
function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-card border border-border/70 px-3 py-2 shadow-xl text-xs">
      <p className="text-muted-foreground mb-1.5">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-bold text-foreground">
            {p.value}{p.name === "Accuracy" ? "%" : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color = "text-primary" }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color?: string;
}) {
  return (
    <div className="p-5 rounded-2xl bg-card border border-border/60 text-center">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className={`text-2xl font-black ${color}`}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

// ─── Insight chip ─────────────────────────────────────────────
function Insight({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string | number; color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-card border border-border/60 px-4 py-3">
      <Icon className={`w-4 h-4 shrink-0 ${color}`} />
      <div>
        <div className={`text-base font-black ${color}`}>{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
export default function Profile() {
  const { nickname } = useParams<{ nickname: string }>();
  const decodedNickname = decodeURIComponent(nickname || "");

  const { data: profile, isLoading, isError } = useGetUserProfile(decodedNickname, {
    query: {
      queryKey: getGetUserProfileQueryKey(decodedNickname),
      enabled: !!decodedNickname,
    },
  });

  // Local analytics data (stored on this device)
  const history       = getTestHistory();
  const heatmap       = getMistakeHeatmap();
  const bestTimeOfDay = getBestTimeOfDay();
  const weeklyImprove = getWeeklyImprovement();
  const lbCount       = getLeaderboardSubmitCount();
  const isPremium     = lbCount >= 10;
  const gameBadgeIds  = getGameBadges();
  const gameBadges    = gameBadgeIds.map(id => GAME_BADGE_DEFS[id]).filter(Boolean);

  const chartData = useMemo(() => (
    [...history].reverse().map((item, i) => ({
      test:     `#${i + 1}`,
      date:     new Date(item.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      wpm:      item.wpm,
      accuracy: item.accuracy,
    }))
  ), [history]);

  const avgWpm = history.length
    ? Math.round(history.reduce((s, h) => s + h.wpm, 0) / history.length)
    : 0;
  const avgAcc = history.length
    ? Math.round(history.reduce((s, h) => s + h.accuracy, 0) / history.length)
    : 0;

  const topMistakeKeys = Object.entries(heatmap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const hasLocalData = history.length > 0;

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
                <Trophy className="w-4 h-4" />View Leaderboard
              </Button>
            </Link>
            <Link href="/test">
              <Button className="gap-2 bg-primary text-white">
                <Zap className="w-4 h-4" />Take a Test
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const level      = getLevel(profile.bestWpm);
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

          {/* ── Profile Header ── */}
          <div className="relative rounded-2xl bg-card border border-border/60 p-8 mb-6 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-black text-white shrink-0">
                {profile.nickname.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <div className={`text-xs font-bold uppercase tracking-widest ${levelColor}`}>{level}</div>
                  {/* Premium badge — 10+ leaderboard submissions */}
                  {isPremium && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-[10px] font-bold">
                      <Crown className="w-3 h-3" />Pro Typist
                    </div>
                  )}
                </div>
                <h1 className="text-3xl font-black mb-1">{profile.nickname}</h1>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Target className="w-3.5 h-3.5" />{profile.totalTests} tests
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-400" />{profile.xp.toLocaleString()} XP
                  </span>
                  {lbCount > 0 && (
                    <span className="flex items-center gap-1 text-primary/70">
                      <Trophy className="w-3.5 h-3.5" />{lbCount} submissions
                      {!isPremium && <span className="text-muted-foreground/50">({10 - lbCount} to Pro badge)</span>}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Server-side Stats Grid ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatCard label="Best WPM"      value={Math.round(profile.bestWpm)}            sub="Personal Best"  icon={Zap}      color="text-primary"    />
            <StatCard label="Avg WPM"       value={Math.round(profile.avgWpm)}             sub="All Tests"      icon={BarChart2} color="text-blue-400"   />
            <StatCard label="Avg Accuracy"  value={`${Math.round(profile.avgAccuracy)}%`}  sub="All Tests"      icon={Target}   color="text-green-400"  />
            <StatCard label="Total Tests"   value={profile.totalTests}                     sub="Completed"      icon={Trophy}   color="text-yellow-400" />
          </div>

          {/* ── Mini-Game Badges ── */}
          {gameBadges.length > 0 && (
            <div className="rounded-2xl bg-card border border-border/60 p-5 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-4 h-4 text-yellow-400" />
                <h2 className="font-bold text-sm">Mini-Game Achievements</h2>
                <span className="ml-auto text-xs text-muted-foreground">{gameBadges.length} earned</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {gameBadges.map(badge => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    title={badge.description}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-border/50 hover:border-border transition-colors cursor-default"
                  >
                    <span className="text-lg">{badge.icon}</span>
                    <div>
                      <div className={`text-xs font-bold ${badge.color}`}>{badge.name}</div>
                      <div className="text-[10px] text-muted-foreground leading-tight max-w-[140px]">{badge.description}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* ── LOCAL ANALYTICS SECTION ── */}
          {hasLocalData && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-3">My Performance (this device)</span>
                <div className="flex-1 h-px bg-border/50" />
              </div>

              {/* Insights row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                <Insight icon={Zap}         label="Avg WPM (local)"      value={avgWpm}                    color="text-primary"    />
                <Insight icon={Target}      label="Avg Accuracy"          value={`${avgAcc}%`}              color={avgAcc >= 95 ? "text-green-400" : avgAcc >= 85 ? "text-yellow-400" : "text-red-400"} />
                <Insight icon={Clock}       label="Best time of day"      value={bestTimeOfDay}             color="text-purple-400" />
                <Insight icon={TrendingUp}  label="This vs last week"     value={weeklyImprove >= 0 ? `+${weeklyImprove}` : String(weeklyImprove)} color={weeklyImprove >= 0 ? "text-green-400" : "text-red-400"} />
              </div>

              {/* WPM Trend */}
              <div className="rounded-2xl bg-card border border-border/60 p-5 mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h2 className="font-bold text-sm">WPM Trend</h2>
                  <span className="text-xs text-muted-foreground ml-1">— last {chartData.length} tests</span>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="wpmGradP" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="10%" stopColor="hsl(220,92%,60%)" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="hsl(220,92%,60%)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,40%,16%)" />
                    <XAxis dataKey="date" tick={{ fill: "hsl(220,20%,55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(220,20%,55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone" dataKey="wpm" name="WPM"
                      stroke="hsl(220,92%,60%)" strokeWidth={2}
                      fill="url(#wpmGradP)"
                      dot={{ r: 3, fill: "hsl(220,92%,60%)", strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: "hsl(220,92%,60%)" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Accuracy Trend */}
              <div className="rounded-2xl bg-card border border-border/60 p-5 mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-4 h-4 text-green-400" />
                  <h2 className="font-bold text-sm">Accuracy Trend</h2>
                </div>
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,40%,16%)" />
                    <XAxis dataKey="date" tick={{ fill: "hsl(220,20%,55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[60, 100]} tick={{ fill: "hsl(220,20%,55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line
                      type="monotone" dataKey="accuracy" name="Accuracy"
                      stroke="hsl(142,71%,55%)" strokeWidth={2}
                      dot={{ r: 3, fill: "hsl(142,71%,55%)", strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: "hsl(142,71%,55%)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Character Heatmap */}
              {Object.keys(heatmap).length > 0 && (
                <div className="rounded-2xl bg-card border border-border/60 p-5 mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Keyboard className="w-4 h-4 text-orange-400" />
                      <h2 className="font-bold text-sm">Mistake Heatmap</h2>
                    </div>
                    <button
                      onClick={() => { clearMistakeHeatmap(); window.location.reload(); }}
                      className="text-xs text-muted-foreground/50 hover:text-muted-foreground flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />Reset
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">Keys you've mistyped most — darker = more mistakes</p>
                  <div className="flex items-center gap-3 mb-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-white/4 border border-white/10 inline-block" />None</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-500/35 inline-block" />Low</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-500/30 border border-orange-500/45 inline-block" />Med</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500/40 border border-red-500/55 inline-block" />High</span>
                  </div>
                  <div className="space-y-2">
                    {KEYBOARD_ROWS.map((row, ri) => (
                      <div key={ri} className="flex gap-1.5 justify-center">
                        {row.map(key => {
                          const count = heatmap[key] || 0;
                          return (
                            <div
                              key={key}
                              title={count > 0 ? `${count} mistake${count !== 1 ? "s" : ""}` : "No mistakes"}
                              className={`w-8 h-8 rounded-lg border flex items-center justify-center text-[11px] font-mono font-bold transition-all cursor-default select-none ${keyHeatClass(count)}`}
                            >
                              {key}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  {topMistakeKeys.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-2">Most problematic keys:</p>
                      <div className="flex flex-wrap gap-2">
                        {topMistakeKeys.map(([key, count]) => (
                          <span key={key} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/15 border border-red-500/25 text-red-300 text-xs font-bold font-mono">
                            {key === " " ? "space" : key}
                            <span className="text-red-400/60 font-normal">{count}×</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recent local tests */}
              <div className="rounded-2xl bg-card border border-border/60 overflow-hidden mb-6">
                <div className="flex items-center gap-2 p-4 border-b border-border/60">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">Local Test History</h2>
                  <span className="text-xs text-muted-foreground ml-auto">{history.length} tests</span>
                </div>
                <div className="divide-y divide-border/40">
                  {history.slice(0, 10).map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-xs text-muted-foreground font-bold shrink-0">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-primary tabular-nums">{item.wpm}</span>
                          <span className="text-xs text-muted-foreground">WPM</span>
                          <span className={`text-sm font-bold ${item.accuracy >= 95 ? "text-green-400" : item.accuracy >= 85 ? "text-yellow-400" : "text-red-400"}`}>
                            {item.accuracy}%
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.duration >= 60 ? `${Math.floor(item.duration / 60)}:${(item.duration % 60).toString().padStart(2, "0")} min` : `${item.duration}s`} · {item.mistakes} mistakes
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground text-right shrink-0">
                        {new Date(item.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        <div className="text-[10px] text-muted-foreground/50">
                          {new Date(item.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Server-side Recent Scores ── */}
          {profile.recentScores && profile.recentScores.length > 0 && (
            <div className="rounded-2xl bg-card border border-border/60 overflow-hidden mb-6">
              <div className="p-5 border-b border-border/60 flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Leaderboard Submissions</h2>
              </div>
              <div className="divide-y divide-border/40">
                {profile.recentScores.slice(0, 10).map((score: ServerScore, i: number) => (
                  <motion.div
                    key={score.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/3 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs text-muted-foreground font-bold">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-primary">{Math.round(score.wpm)}</span>
                        <span className="text-sm text-muted-foreground">WPM</span>
                        <span className="text-sm text-green-400">{Math.round(score.accuracy)}%</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{score.duration}s test · {score.mistakes} mistakes</div>
                    </div>
                    <div className="text-xs text-muted-foreground text-right shrink-0">
                      {score.createdAt ? new Date(score.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Link href="/test">
              <Button className="gap-2 bg-gradient-to-r from-primary to-accent text-white font-bold hover:opacity-90">
                <Zap className="w-4 h-4" />Take a Test
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button variant="outline" className="gap-2 border-border/60 hover:bg-white/5">
                <Trophy className="w-4 h-4" />Leaderboard
              </Button>
            </Link>
          </div>

        </motion.div>
      </div>
    </div>
  );
}

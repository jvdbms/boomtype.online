import { useMemo, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  ArrowLeft, TrendingUp, Target, Clock, Zap, Trophy,
  Crown, Keyboard, BarChart2, Calendar, RefreshCw, Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getTestHistory, getMistakeHeatmap, getBestTimeOfDay,
  getWeeklyImprovement, getLeaderboardSubmitCount,
  getHighScore, getTotalXP, getStreak, clearMistakeHeatmap,
} from "@/lib/storage";
import { getLevel, getLevelColor } from "@/lib/words";

// ─── Keyboard layout for heatmap ────────────────────────────
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

// ─── Custom recharts tooltip ─────────────────────────────────
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
          <span className="font-bold text-foreground">{p.value}{p.name === "Accuracy" ? "%" : ""}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Insight card ────────────────────────────────────────────
function InsightCard({ icon: Icon, label, value, sub, color = "text-primary", bg = "bg-primary/10" }: {
  icon: React.ElementType; label: string; value: string | number;
  sub?: string; color?: string; bg?: string;
}) {
  return (
    <div className="rounded-2xl bg-card border border-border/60 p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <div className={`text-xl font-black ${color}`}>{value}</div>
        {sub && <div className="text-[10px] text-muted-foreground/60">{sub}</div>}
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center px-4"
    >
      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
        <BarChart2 className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-2xl font-black mb-2">No data yet</h2>
      <p className="text-muted-foreground mb-6 max-w-xs">
        Complete a few typing tests to see your speed trends, accuracy charts, and character heatmap here.
      </p>
      <Link href="/test">
        <Button className="gap-2 bg-primary text-white font-bold">
          <Zap className="w-4 h-4" />Take a Test
        </Button>
      </Link>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────
export default function Analytics() {
  const history          = getTestHistory();
  const heatmap          = getMistakeHeatmap();
  const bestTimeOfDay    = getBestTimeOfDay();
  const weeklyImprove    = getWeeklyImprovement();
  const lbCount          = getLeaderboardSubmitCount();
  const bestWpm          = getHighScore();
  const totalXP          = getTotalXP();
  const streak           = getStreak().count;
  const isPremium        = lbCount >= 10;
  const level            = getLevel(bestWpm);
  const levelColor       = getLevelColor(level);

  useEffect(() => {
    document.title = "My Analytics | BoomType";
  }, []);

  const chartData = useMemo(() => (
    [...history].reverse().map((item, i) => ({
      test: `#${i + 1}`,
      date: new Date(item.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      wpm:      item.wpm,
      accuracy: item.accuracy,
      duration: item.duration,
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

  const totalMistakeKeys = Object.keys(heatmap).length;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

          {/* ── Top bar ── */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />Dashboard
            </Link>
            <div className="flex items-center gap-2">
              {isPremium && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-xs font-bold">
                  <Crown className="w-3.5 h-3.5" />Pro Typist
                </div>
              )}
              <Link href="/test">
                <Button size="sm" className="gap-2 bg-primary text-white text-xs">
                  <Zap className="w-3.5 h-3.5" />New Test
                </Button>
              </Link>
            </div>
          </div>

          {/* ── Profile summary ── */}
          <div className="rounded-2xl bg-card border border-border/60 p-6 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-black text-white shrink-0">
                {bestWpm > 0 ? bestWpm : "?"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-black">My Analytics</h1>
                  {isPremium && <Crown className="w-5 h-5 text-yellow-400" />}
                </div>
                <div className={`text-sm font-bold ${levelColor} mb-2`}>{level} Typist</div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-yellow-400" />{history.length} tests</span>
                  <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-400" />{streak}-day streak</span>
                  <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-primary" />{totalXP.toLocaleString()} XP</span>
                  {lbCount > 0 && (
                    <span className="flex items-center gap-1 text-primary">
                      <Crown className="w-3.5 h-3.5" />{lbCount} leaderboard submissions
                      {!isPremium && <span className="text-muted-foreground/60"> ({10 - lbCount} to Pro badge)</span>}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {history.length === 0 ? <EmptyState /> : (
            <>
              {/* ── Insight cards ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <InsightCard icon={Zap}         label="Best WPM"       value={bestWpm}              color="text-primary"    bg="bg-primary/10" />
                <InsightCard icon={BarChart2}    label="Avg WPM"        value={avgWpm}               color="text-blue-400"   bg="bg-blue-500/10" sub={`last ${history.length} tests`} />
                <InsightCard icon={Target}       label="Avg Accuracy"   value={`${avgAcc}%`}         color={avgAcc >= 95 ? "text-green-400" : avgAcc >= 85 ? "text-yellow-400" : "text-red-400"} bg="bg-green-500/10" />
                <InsightCard icon={TrendingUp}   label="This Week"      value={weeklyImprove >= 0 ? `+${weeklyImprove}` : weeklyImprove} color={weeklyImprove >= 0 ? "text-green-400" : "text-red-400"} bg="bg-teal-500/10" sub="WPM vs last week" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <InsightCard icon={Clock}     label="Best Time of Day" value={bestTimeOfDay}       color="text-purple-400"  bg="bg-purple-500/10" />
                <InsightCard icon={Calendar}  label="Total Tests"       value={history.length}     color="text-accent"      bg="bg-accent/10" />
                <InsightCard icon={Keyboard}  label="Keys Tracked"      value={totalMistakeKeys}   color="text-orange-400"  bg="bg-orange-500/10" sub="unique chars" />
                <InsightCard icon={Crown}     label="Leaderboard"       value={lbCount}            color={isPremium ? "text-yellow-400" : "text-muted-foreground"} bg={isPremium ? "bg-yellow-500/15" : "bg-white/5"} sub={isPremium ? "Pro badge earned!" : `${10 - lbCount} more for Pro`} />
              </div>

              {/* ── WPM Trend Chart ── */}
              <div className="rounded-2xl bg-card border border-border/60 p-5 mb-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h2 className="font-bold text-sm">WPM Trend</h2>
                  <span className="text-xs text-muted-foreground ml-1">— last {chartData.length} tests</span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="wpmGrad" x1="0" y1="0" x2="0" y2="1">
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
                      fill="url(#wpmGrad)" dot={{ r: 3, fill: "hsl(220,92%,60%)", strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: "hsl(220,92%,60%)" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* ── Accuracy Trend Chart ── */}
              <div className="rounded-2xl bg-card border border-border/60 p-5 mb-5">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-4 h-4 text-green-400" />
                  <h2 className="font-bold text-sm">Accuracy Trend</h2>
                  <span className="text-xs text-muted-foreground ml-1">— last {chartData.length} tests</span>
                </div>
                <ResponsiveContainer width="100%" height={170}>
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

              {/* ── Character Heatmap ── */}
              {Object.keys(heatmap).length > 0 && (
                <div className="rounded-2xl bg-card border border-border/60 p-5 mb-5">
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

                  {/* Legend */}
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
                              className={`
                                w-9 h-9 rounded-lg border flex items-center justify-center
                                text-xs font-mono font-bold transition-all cursor-default
                                select-none ${keyHeatClass(count)}
                              `}
                            >
                              {key}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Top mistake keys */}
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

              {/* ── Test History Table ── */}
              <div className="rounded-2xl bg-card border border-border/60 overflow-hidden">
                <div className="flex items-center gap-2 p-4 border-b border-border/60">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">Test History</h2>
                  <span className="text-xs text-muted-foreground ml-auto">Last {history.length} tests</span>
                </div>
                <div className="divide-y divide-border/40">
                  {history.map((item, i) => {
                    const isNew = i === 0;
                    const minSec = `${Math.floor(item.duration / 60)}:${(item.duration % 60).toString().padStart(2, "0")}`;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(i * 0.03, 0.4) }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-xs text-muted-foreground font-bold shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-primary tabular-nums">{item.wpm}</span>
                            <span className="text-xs text-muted-foreground">WPM</span>
                            <span className={`text-sm font-bold ${item.accuracy >= 95 ? "text-green-400" : item.accuracy >= 85 ? "text-yellow-400" : "text-red-400"}`}>
                              {item.accuracy}%
                            </span>
                            {isNew && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-bold border border-primary/25">NEW</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.duration >= 60 ? minSec + " min" : item.duration + "s"} · {item.mistakes} mistakes
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground text-right shrink-0">
                          {new Date(item.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          <div className="text-[10px] text-muted-foreground/50">
                            {new Date(item.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

            </>
          )}

        </motion.div>
      </div>
    </div>
  );
}

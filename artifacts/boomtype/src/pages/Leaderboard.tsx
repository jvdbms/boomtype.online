import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Trophy, Medal } from "lucide-react";
import { useGetLeaderboard, getGetLeaderboardQueryKey } from "@workspace/api-client-react";
import type { GetLeaderboardParams } from "@workspace/api-client-react";
import { getLevelColor } from "@/lib/words";
import AdBanner from "@/components/AdBanner";

type Period = "daily" | "weekly" | "all_time";

const TABS: { label: string; value: Period }[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "All Time", value: "all_time" },
];

export default function Leaderboard() {
  const [period, setPeriod] = useState<Period>("all_time");

  useEffect(() => {
    document.title = "Typing Leaderboard | BoomType — Top WPM Rankings";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "See the top WPM typists worldwide. Daily, weekly, and all-time rankings on BoomType.");
  }, []);

  const params: GetLeaderboardParams = { period, limit: 10 };
  const { data: leaderboard, isLoading } = useGetLeaderboard(params, {
    query: { queryKey: getGetLeaderboardQueryKey(params) }
  });

  const rankStyle = (rank: number) => {
    if (rank === 1) return { bg: "bg-yellow-500/15", text: "text-yellow-400", border: "border-yellow-500/30" };
    if (rank === 2) return { bg: "bg-gray-400/15", text: "text-gray-300", border: "border-gray-400/30" };
    if (rank === 3) return { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/30" };
    return { bg: "bg-white/5", text: "text-muted-foreground", border: "border-border/40" };
  };

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Trophy className="w-4 h-4" />
            Global Rankings
          </div>
          <h1 className="text-4xl font-black mb-3">Leaderboard</h1>
          <p className="text-muted-foreground">Top typists competing worldwide — click a name to view their profile</p>
        </div>

        {/* Period Tabs */}
        <div className="flex bg-card/40 rounded-xl p-1 mb-8 border border-border/60">
          {TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setPeriod(tab.value)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                period === tab.value
                  ? "bg-primary text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`tab-${tab.value}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Top 3 Podium */}
        {!isLoading && leaderboard && leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, podiumIdx) => {
              if (!entry) return null;
              const rankMap = [2, 1, 3];
              const rank = rankMap[podiumIdx];
              const style = rankStyle(rank);
              const heights = ["h-24", "h-32", "h-20"];

              return (
                <Link key={entry.nickname} href={`/profile/${encodeURIComponent(entry.nickname)}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: podiumIdx * 0.1 }}
                    className={`${heights[podiumIdx]} rounded-2xl ${style.bg} border ${style.border} flex flex-col items-center justify-end p-4 cursor-pointer hover:opacity-80 transition-opacity`}
                  >
                    <div className={`text-2xl font-black ${style.text} mb-1`}>{Math.round(entry.wpm)}</div>
                    <div className="text-xs text-muted-foreground mb-1">WPM</div>
                    <div className="text-sm font-bold truncate w-full text-center">{entry.nickname}</div>
                    <div className={`text-xs ${style.text} font-bold mt-0.5`}>#{rank}</div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Ad */}
        <div className="flex justify-center mb-6">
          <AdBanner size="leaderboard" />
        </div>

        {/* Full List */}
        <div className="rounded-2xl bg-card border border-border/60 overflow-hidden">
          <div className="p-4 border-b border-border/60">
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Rankings</span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Loading rankings...</p>
            </div>
          ) : leaderboard && leaderboard.length > 0 ? (
            <div className="divide-y divide-border/40">
              {leaderboard.map((entry, i) => {
                const style = rankStyle(entry.rank);
                return (
                  <Link key={entry.nickname} href={`/profile/${encodeURIComponent(entry.nickname)}`}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 p-4 hover:bg-white/3 transition-colors cursor-pointer group"
                      data-testid={`leaderboard-row-${i}`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black ${style.bg} ${style.text}`}>
                        {entry.rank <= 3 ? (
                          <Medal className="w-4 h-4" />
                        ) : (
                          entry.rank
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate group-hover:text-primary transition-colors">{entry.nickname}</div>
                        <div className={`text-xs ${getLevelColor(entry.level)} font-medium`}>{entry.level}</div>
                      </div>

                      <div className="text-right mr-4 hidden sm:block">
                        <div className="text-sm text-muted-foreground">{entry.testsCount} tests</div>
                        <div className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">View profile →</div>
                      </div>

                      <div className="text-right">
                        <div className={`text-2xl font-black ${style.text}`}>{Math.round(entry.wpm)}</div>
                        <div className="text-xs text-muted-foreground">WPM</div>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No entries yet. Be the first!</p>
              <Link href="/test" className="inline-block mt-4 text-sm text-primary hover:underline">
                Take a test →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

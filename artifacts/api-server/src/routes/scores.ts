import { Router, type IRouter } from "express";
import { db, scoresTable } from "@workspace/db";
import { eq, desc, gte, sql, max, avg, count, asc } from "drizzle-orm";
import {
  SubmitScoreBody,
  GetLeaderboardQueryParams,
  GetLeaderboardResponse,
  GetMyLeaderboardRankQueryParams,
  GetMyLeaderboardRankResponse,
  GetStatsSummaryResponse,
  GetRecentActivityQueryParams,
  GetRecentActivityResponse,
  GetUserProfileParams,
  GetUserProfileResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function getLevel(wpm: number): string {
  if (wpm < 30) return "Beginner";
  if (wpm < 60) return "Intermediate";
  if (wpm < 90) return "Pro";
  return "Master";
}

router.post("/scores", async (req, res): Promise<void> => {
  const parsed = SubmitScoreBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [score] = await db.insert(scoresTable).values({
    nickname: parsed.data.nickname,
    wpm: parsed.data.wpm,
    accuracy: parsed.data.accuracy,
    duration: parsed.data.duration,
    mistakes: parsed.data.mistakes,
  }).returning();

  req.log.info({ scoreId: score.id, nickname: score.nickname, wpm: score.wpm }, "Score submitted");
  res.status(201).json(score);
});

router.get("/leaderboard", async (req, res): Promise<void> => {
  const parsed = GetLeaderboardQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { period, limit } = parsed.data;

  let dateFilter: Date | undefined;
  const now = new Date();
  if (period === "daily") {
    dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === "weekly") {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    dateFilter = weekAgo;
  }

  const baseQuery = db
    .select({
      nickname: scoresTable.nickname,
      wpm: max(scoresTable.wpm).as("best_wpm"),
      accuracy: avg(scoresTable.accuracy).as("avg_accuracy"),
      testsCount: count(scoresTable.id).as("tests_count"),
    })
    .from(scoresTable);

  const query = dateFilter
    ? baseQuery.where(gte(scoresTable.createdAt, dateFilter))
    : baseQuery;

  const results = await query
    .groupBy(scoresTable.nickname)
    .orderBy(desc(max(scoresTable.wpm)))
    .limit(limit || 10);

  const leaderboard = results.map((row, i) => ({
    rank: i + 1,
    nickname: row.nickname,
    wpm: Number(row.wpm) || 0,
    accuracy: Number(row.accuracy) || 0,
    testsCount: Number(row.testsCount) || 0,
    level: getLevel(Number(row.wpm) || 0),
  }));

  res.json(GetLeaderboardResponse.parse(leaderboard));
});

router.get("/leaderboard/me", async (req, res): Promise<void> => {
  const parsed = GetMyLeaderboardRankQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { nickname, period } = parsed.data;
  const normalizedNickname = nickname.trim();

  let dateFilter: Date | undefined;
  const now = new Date();
  if (period === "daily") {
    dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === "weekly") {
    dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  const bestForUserQuery = db
    .select({ best: max(scoresTable.wpm).as("best") })
    .from(scoresTable)
    .where(
      dateFilter
        ? sql`lower(${scoresTable.nickname}) = lower(${normalizedNickname}) and ${scoresTable.createdAt} >= ${dateFilter}`
        : sql`lower(${scoresTable.nickname}) = lower(${normalizedNickname})`
    );

  const [userRow] = await bestForUserQuery;
  const bestWpm = userRow?.best != null ? Number(userRow.best) : null;

  const totalsQuery = db
    .select({
      nickname: scoresTable.nickname,
      best: max(scoresTable.wpm).as("best"),
    })
    .from(scoresTable);

  const grouped = await (dateFilter
    ? totalsQuery.where(gte(scoresTable.createdAt, dateFilter))
    : totalsQuery
  ).groupBy(scoresTable.nickname);

  const totalPlayers = grouped.length;
  let rank: number | null = null;
  if (bestWpm != null) {
    const higher = grouped.filter((g) => Number(g.best) > bestWpm).length;
    rank = higher + 1;
  }

  const payload = {
    nickname: normalizedNickname,
    period,
    rank,
    bestWpm,
    totalPlayers,
  };

  res.json(GetMyLeaderboardRankResponse.parse(payload));
});

router.get("/stats/summary", async (_req, res): Promise<void> => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [totals] = await db
    .select({
      totalTests: count(scoresTable.id),
      avgWpm: avg(scoresTable.wpm),
      topWpm: max(scoresTable.wpm),
    })
    .from(scoresTable);

  const [todayCount] = await db
    .select({ count: count(scoresTable.id) })
    .from(scoresTable)
    .where(gte(scoresTable.createdAt, todayStart));

  const [userCount] = await db
    .select({ count: sql<number>`count(distinct ${scoresTable.nickname})` })
    .from(scoresTable);

  const summary = {
    totalTests: Number(totals.totalTests) || 0,
    testsToday: Number(todayCount.count) || 0,
    avgWpm: Number(totals.avgWpm) || 0,
    topWpm: Number(totals.topWpm) || 0,
    totalUsers: Number(userCount.count) || 0,
  };

  res.json(GetStatsSummaryResponse.parse(summary));
});

router.get("/stats/recent", async (req, res): Promise<void> => {
  const parsed = GetRecentActivityQueryParams.safeParse(req.query);
  const limit = parsed.success ? (parsed.data.limit || 5) : 5;

  const scores = await db
    .select()
    .from(scoresTable)
    .orderBy(desc(scoresTable.createdAt))
    .limit(limit);

  res.json(GetRecentActivityResponse.parse(scores));
});

router.get("/users/:nickname", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.nickname) ? req.params.nickname[0] : req.params.nickname;
  const params = GetUserProfileParams.safeParse({ nickname: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { nickname } = params.data;

  const userScores = await db
    .select()
    .from(scoresTable)
    .where(eq(scoresTable.nickname, nickname))
    .orderBy(desc(scoresTable.createdAt));

  if (userScores.length === 0) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const wmps = userScores.map(s => s.wpm);
  const bestWpm = Math.max(...wmps);
  const avgWpm = wmps.reduce((a, b) => a + b, 0) / wmps.length;
  const avgAccuracy = userScores.reduce((a, s) => a + s.accuracy, 0) / userScores.length;

  const profile = {
    nickname,
    bestWpm,
    avgWpm,
    avgAccuracy,
    totalTests: userScores.length,
    level: getLevel(bestWpm),
    xp: Math.round(userScores.reduce((acc, s) => acc + s.wpm * (s.accuracy / 100) * (s.duration / 30), 0)),
    streak: 1,
    recentScores: userScores.slice(0, 10),
  };

  res.json(GetUserProfileResponse.parse(profile));
});

export default router;

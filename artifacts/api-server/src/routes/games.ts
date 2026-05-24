import { Router, type IRouter } from "express";
import { db, gameScoresTable } from "@workspace/db";
import { eq, desc, max, sql } from "drizzle-orm";
import {
  SubmitGameScoreBody,
  GetGameLeaderboardQueryParams,
  GetGameLeaderboardResponse,
  GetGameXpLeaderboardQueryParams,
  GetGameXpLeaderboardResponse,
  GetMyGameXpRankQueryParams,
  GetMyGameXpRankResponse,
} from "@workspace/api-zod";

/**
 * Per-submission XP formula. Must stay in sync with the client-side
 * `calculateGameXP` in artifacts/boomtype/src/lib/storage.ts.
 */
const gameXpExpr = sql<number>`
  case ${gameScoresTable.game}
    when 'word-rain'     then ${gameScoresTable.score}
    when 'zombie-attack' then ${gameScoresTable.score}
    when 'speed-burst'   then round(${gameScoresTable.score} / 5.0)
    when 'bubble-pop'    then round(${gameScoresTable.score} / 10.0)
    when 'word-tetris'   then round(${gameScoresTable.score} / 3.0)
    when 'pipe-run'      then ${gameScoresTable.score}
    when 'alphabet-race' then 20
    when 'cloud-race'    then ${gameScoresTable.score}
    else round(${gameScoresTable.score} / 2.0)
  end
`;

const router: IRouter = Router();

router.post("/scores/games", async (req, res): Promise<void> => {
  const parsed = SubmitGameScoreBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [gameScore] = await db
    .insert(gameScoresTable)
    .values({
      nickname: parsed.data.nickname,
      game: parsed.data.game,
      score: parsed.data.score,
    })
    .returning();

  req.log.info(
    { scoreId: gameScore.id, nickname: gameScore.nickname, game: gameScore.game, score: gameScore.score },
    "Game score submitted",
  );
  res.status(201).json(gameScore);
});

router.get("/scores/games", async (req, res): Promise<void> => {
  const parsed = GetGameLeaderboardQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { game, limit } = parsed.data;

  const results = await db
    .select({
      nickname: gameScoresTable.nickname,
      score: max(gameScoresTable.score).as("best_score"),
    })
    .from(gameScoresTable)
    .where(eq(gameScoresTable.game, game))
    .groupBy(gameScoresTable.nickname)
    .orderBy(desc(max(gameScoresTable.score)))
    .limit(limit || 10);

  const leaderboard = results.map((row, i) => ({
    rank: i + 1,
    nickname: row.nickname,
    score: Number(row.score) || 0,
  }));

  res.json(GetGameLeaderboardResponse.parse(leaderboard));
});

router.get("/leaderboard/games-xp", async (req, res): Promise<void> => {
  const parsed = GetGameXpLeaderboardQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { limit } = parsed.data;

  const results = await db
    .select({
      nickname: gameScoresTable.nickname,
      xp: sql<number>`sum(${gameXpExpr})`.as("total_xp"),
      gamesPlayed: sql<number>`count(${gameScoresTable.id})`.as("games_played"),
    })
    .from(gameScoresTable)
    .groupBy(gameScoresTable.nickname)
    .orderBy(desc(sql`sum(${gameXpExpr})`))
    .limit(limit || 10);

  const leaderboard = results.map((row, i) => ({
    rank: i + 1,
    nickname: row.nickname,
    xp: Math.round(Number(row.xp) || 0),
    gamesPlayed: Number(row.gamesPlayed) || 0,
  }));

  res.json(GetGameXpLeaderboardResponse.parse(leaderboard));
});

router.get("/leaderboard/games-xp/me", async (req, res): Promise<void> => {
  const parsed = GetMyGameXpRankQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const normalizedNickname = parsed.data.nickname.trim();

  const grouped = await db
    .select({
      nickname: gameScoresTable.nickname,
      xp: sql<number>`sum(${gameXpExpr})`.as("total_xp"),
    })
    .from(gameScoresTable)
    .groupBy(gameScoresTable.nickname);

  const totalPlayers = grouped.length;
  const userRow = grouped.find(
    (g) => g.nickname.toLowerCase() === normalizedNickname.toLowerCase(),
  );
  const userXp = userRow ? Math.round(Number(userRow.xp) || 0) : 0;
  let rank: number | null = null;
  if (userRow) {
    const higher = grouped.filter((g) => Number(g.xp) > Number(userRow.xp)).length;
    rank = higher + 1;
  }

  res.json(
    GetMyGameXpRankResponse.parse({
      nickname: normalizedNickname,
      rank,
      xp: userXp,
      totalPlayers,
    }),
  );
});

export default router;

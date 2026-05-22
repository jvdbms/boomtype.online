import { Router, type IRouter } from "express";
import { db, gameScoresTable } from "@workspace/db";
import { eq, desc, max, sql } from "drizzle-orm";
import {
  SubmitGameScoreBody,
  GetGameLeaderboardQueryParams,
  GetGameLeaderboardResponse,
} from "@workspace/api-zod";

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

export default router;

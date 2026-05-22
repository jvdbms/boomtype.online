import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const gameScoresTable = pgTable("game_scores", {
  id: serial("id").primaryKey(),
  nickname: text("nickname").notNull(),
  game: text("game").notNull(),
  score: integer("score").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGameScoreSchema = createInsertSchema(gameScoresTable).omit({ id: true, createdAt: true });
export type InsertGameScore = z.infer<typeof insertGameScoreSchema>;
export type GameScore = typeof gameScoresTable.$inferSelect;

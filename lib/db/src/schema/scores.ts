import { pgTable, text, serial, timestamp, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const scoresTable = pgTable("scores", {
  id: serial("id").primaryKey(),
  nickname: text("nickname").notNull(),
  wpm: real("wpm").notNull(),
  accuracy: real("accuracy").notNull(),
  duration: integer("duration").notNull(),
  mistakes: integer("mistakes").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertScoreSchema = createInsertSchema(scoresTable).omit({ id: true, createdAt: true });
export type InsertScore = z.infer<typeof insertScoreSchema>;
export type Score = typeof scoresTable.$inferSelect;

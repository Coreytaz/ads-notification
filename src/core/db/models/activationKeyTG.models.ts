import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { timestamps } from "../utils/timestamps.helpers";
import { chatTG } from "./chatTG.models";

export const activationKeyTG = sqliteTable("activation_key_tg", {
  id: int().primaryKey({ autoIncrement: true }),
  key: text().notNull().unique(),
  durationDays: int().notNull(),
  expiresAt: int(),
  isUsed: int().default(0),
  usedBy: int().references(() => chatTG.id),
  usedAt: text()
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  ...timestamps,
});

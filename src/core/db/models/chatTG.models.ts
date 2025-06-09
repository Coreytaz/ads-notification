import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { timestamps } from "../utils/timestamps.helpers";
import { role } from "./role.models";

export const chatTG = sqliteTable("chat_tg", {
  id: int().primaryKey({ autoIncrement: true }),
  chatId: text().notNull().unique(),
  name: text().notNull(),
  roleId: int()
    .notNull()
    .references(() => role.id),
  subscriptionExpiresAt: text().default(sql`NULL`),
  ...timestamps,
});

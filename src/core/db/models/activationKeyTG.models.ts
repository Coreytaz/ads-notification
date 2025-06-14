import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { timestamps } from "../utils/timestamps.helpers";

export const activationKeyTG = sqliteTable("activation_key_tg", {
  id: int().primaryKey({ autoIncrement: true }),
  key: text().notNull().unique(),
  expiresAt: int(),
  isUsed: int().default(0),
  data: text({ mode: "json" })
    .$type<
      Partial<{
        roleId: string;
        [key: string]: any;
      }>
    >()
    .notNull()
    .default({}),
  ...timestamps,
});

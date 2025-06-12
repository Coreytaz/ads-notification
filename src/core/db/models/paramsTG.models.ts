import { and, eq } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { drizzle } from "../drizzle";
import { createOne } from "../utils/createOne";
import { timestamps } from "../utils/timestamps.helpers";

export const paramsTG = sqliteTable("params_tg", {
  id: int("id").primaryKey({ autoIncrement: true }),
  data: text("data", { mode: "json" }).notNull().default({}),
  relationKey: text("relationKey")
    .$defaultFn(() => crypto.randomUUID())
    .notNull(),
  ...timestamps,
});

export const findOneParamsTG = async (
  args: Partial<Omit<typeof paramsTG.$inferSelect, keyof typeof timestamps>>,
) => {
  return drizzle
    .select()
    .from(paramsTG)
    .where(
      and(
        ...Object.entries(args).map(([key, value]) =>
          eq(paramsTG[key as keyof typeof paramsTG.$inferSelect], value),
        ),
      ),
    )
    .get();
};

export const createOneParamsTG = async (
  args: Omit<typeof paramsTG.$inferInsert, keyof typeof timestamps>,
) => {
  return createOne(paramsTG)(args);
};

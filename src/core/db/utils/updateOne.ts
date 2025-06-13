import { and, eq } from "drizzle-orm";
import { SQLiteTable } from "drizzle-orm/sqlite-core";

import { drizzle } from "../drizzle";

export const updateOne = <T extends SQLiteTable>(table: T) => {
  return async (
    args: T["$inferInsert"],
    where?: Partial<T["$inferSelect"]>,
  ) => {
    return await drizzle
      .update(table)
      .set(args)
      .where(
        and(
          ...Object.entries(where ?? {}).map(([key, value]) =>
            eq(table[key as keyof T] as any, value),
          ),
        ),
      )
      .returning()
      .get();
  };
};

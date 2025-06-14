import { and, eq, type SQLWrapper } from "drizzle-orm";
import { SQLiteTable } from "drizzle-orm/sqlite-core";

import { drizzle } from "../drizzle";

export const updateOne = <T extends SQLiteTable>(table: T) => {
  return async (
    args: Partial<T["$inferInsert"]>,
    where?: Partial<T["$inferSelect"]>,
    ...rest: (SQLWrapper | undefined)[]
  ) => {
    return await drizzle
      .update(table)
      .set(args)
      .where(
        and(
          ...Object.entries(where ?? {}).map(([key, value]) =>
            eq(table[key as keyof T] as any, value),
          ),
          ...rest,
        ),
      )
      .returning()
      .get();
  };
};

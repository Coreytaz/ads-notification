import { and, eq, SQLWrapper } from "drizzle-orm";
import { SQLiteTable } from "drizzle-orm/sqlite-core";

import { drizzle } from "../drizzle";

export const deleteOne = <T extends SQLiteTable>(table: T) => {
  return async (
    args?: Partial<T["$inferSelect"]>,
    ...rest: (SQLWrapper | undefined)[]
  ) => {
    return await drizzle
      .delete(table)
      .where(
        and(
          ...Object.entries(args ?? {}).map(([key, value]) =>
            eq(table[key as keyof T] as any, value),
          ),
          ...rest,
        ),
      )
      .returning()
      .get();
  };
};

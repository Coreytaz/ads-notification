import { and, eq, SQLWrapper } from "drizzle-orm";
import { SQLiteTable } from "drizzle-orm/sqlite-core";

import { drizzle } from "../drizzle";

export const getOne = <T extends SQLiteTable>(table: T) => {
  return async (
    args: Partial<T["$inferSelect"]>,
    ...rest: (SQLWrapper | undefined)[]
  ) => {
    return drizzle
      .select()
      .from(table)
      .where(
        and(
          ...Object.entries(args).map(([key, value]) =>
            eq(table[key as keyof T] as any, value),
          ),
          ...rest,
        ),
      )
      .get();
  };
};

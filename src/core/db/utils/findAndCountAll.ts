import { and, count, eq } from "drizzle-orm";
import { SQLiteTable } from "drizzle-orm/sqlite-core";

import { drizzle } from "../drizzle";

export const findAndCountAll = <T extends SQLiteTable>(table: T) => {
  return async (
    args: Partial<T["$inferSelect"]>,
    options: { limit: number; offset: number },
  ) => {
    return drizzle.transaction(async tx => {
      const data = await tx
        .select()
        .from(table)
        .where(
          and(
            ...Object.entries(args).map(([key, value]) =>
              eq(table[key as keyof T] as any, value),
            ),
          ),
        )
        .limit(options.limit)
        .offset(options.offset)
        .all();

      const total = await tx
        .select({ value: count() })
        .from(table)
        .where(
          and(
            ...Object.entries(args).map(([key, value]) =>
              eq(table[key as keyof T] as any, value),
            ),
          ),
        )
        .then(res => res[0]?.value ?? 0);

      return { data, total };
    });
  };
};

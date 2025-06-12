import { SQLiteTable } from "drizzle-orm/sqlite-core";

import { drizzle } from "../drizzle";

export const createOne = <T extends SQLiteTable>(table: T) => {
  return async (args: T["$inferInsert"]) => {
    return await drizzle.insert(table).values(args).returning().get();
  };
};

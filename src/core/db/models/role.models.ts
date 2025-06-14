import { SQLWrapper } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { getAll } from "../utils/getAll";
import { getOne } from "../utils/getOne";
import { timestamps } from "../utils/timestamps.helpers";

export const role = sqliteTable("role", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  ...timestamps,
});

export const getOneRole = async (args: Partial<typeof role.$inferSelect>) => {
  return getOne(role)(args);
};

export const getAllRoles = async (
  args: Partial<typeof role.$inferSelect>,
  ...where: (SQLWrapper | undefined)[]
) => {
  return getAll(role)(args, ...where);
};

import { relations, SQLWrapper } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { getAll } from "../utils/getAll";
import { permissionRules } from "./permissionRule.models";
import { permissions } from "./permissions.models";

export const rules = sqliteTable("rules", {
  id: int("id").primaryKey({ autoIncrement: true }),
  route: text("route").unique(),
  enable: int("enable").notNull().default(1),
  attr: text("attr", { mode: "json" }).notNull().default({}),
});

export const rulesRelations = relations(rules, ({ many }) => ({
  permissionRules: many(permissionRules),
  permissions: many(permissions),
}));

export const getAllRules = async (
  args: Partial<typeof rules.$inferSelect>,
  ...where: (SQLWrapper | undefined)[]
) => {
  return getAll(rules)(args, ...where);
};

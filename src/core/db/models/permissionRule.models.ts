import { relations, SQLWrapper } from "drizzle-orm";
import { int, sqliteTable } from "drizzle-orm/sqlite-core";

import { getAll } from "../utils/getAll";
import { permissions } from "./permissions.models";
import { rules } from "./rule.models";

export const permissionRules = sqliteTable("permission_rules", {
  permissionId: int("permission_id")
    .notNull()
    .references(() => permissions.id, { onDelete: "cascade" }),
  ruleId: int("rule_id")
    .notNull()
    .references(() => rules.id, { onDelete: "cascade" }),
});

export const permissionRulesRelations = relations(
  permissionRules,
  ({ one }) => ({
    permission: one(permissions, {
      fields: [permissionRules.permissionId],
      references: [permissions.id],
    }),
    rule: one(rules, {
      fields: [permissionRules.ruleId],
      references: [rules.id],
    }),
  }),
);

export const getAllPermissionRules = async (
  args: Partial<typeof permissionRules.$inferSelect>,
  ...where: (SQLWrapper | undefined)[]
) => {
  return getAll(permissionRules)(args, ...where);
};

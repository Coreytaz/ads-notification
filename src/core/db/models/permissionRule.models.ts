import { relations } from "drizzle-orm";
import { int, sqliteTable } from "drizzle-orm/sqlite-core";

import { permissions } from "./permissions.models";
import { rules } from "./rule.models";

export const permissionRules = sqliteTable("permission_rules", {
  permissionId: int("permission_id")
    .notNull()
    .references(() => permissions.id),
  ruleId: int("rule_id")
    .notNull()
    .references(() => rules.id),
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

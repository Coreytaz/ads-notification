// Permissions.models.ts
import { relations, SQLWrapper } from "drizzle-orm";
import { sql } from "drizzle-orm"; // make sure sql is imported
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { getAll } from "../utils/getAll";
import { chatTG } from "./chatTG.models";
import { permissionRules } from "./permissionRule.models";
import { role } from "./role.models";
import { rules } from "./rule.models";
import { typeTG } from "./typeTG.models";

export const permissions = sqliteTable("permissions", {
  id: int("id").primaryKey({ autoIncrement: true }),
  roleId: int("role_id")
    .notNull()
    .references(() => role.id),
  enable: int("enable").notNull().default(1),
  chatType: int("chat_type")
    .notNull()
    .references(() => typeTG.id),
  chatId: text("chat_id")
    .references(() => chatTG.chatId)
    .default(sql`NULL`),
});

export const permissionsRelations = relations(permissions, ({ one, many }) => ({
  role: one(role, {
    fields: [permissions.roleId],
    references: [role.id],
  }),
  chat: one(chatTG, {
    fields: [permissions.chatId],
    references: [chatTG.chatId],
  }),
  permissionRules: many(permissionRules),
  rules: many(rules),
}));

export const getAllPermissions = async (
  args: Partial<typeof permissions.$inferSelect>,
  ...where: (SQLWrapper | undefined)[]
) => {
  return getAll(permissions)(args, ...where);
};

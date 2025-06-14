import { sql, type SQLWrapper } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { findAndCountAll } from "../utils/findAndCountAll";
import { getOne } from "../utils/getOne";
import { timestamps } from "../utils/timestamps.helpers";
import { updateOne } from "../utils/updateOne";
import { role } from "./role.models";

export const chatTG = sqliteTable("chat_tg", {
  id: int().primaryKey({ autoIncrement: true }),
  chatId: text().notNull().unique(),
  name: text().notNull(),
  roleId: int()
    .notNull()
    .references(() => role.id),
  subscriptionExpiresAt: text().default(sql`NULL`),
  ...timestamps,
});

export const findAndCountAllChatTG = async <T extends typeof chatTG>(
  args: Partial<T["$inferSelect"]>,
  options: { limit: number; offset: number },
  ...where: (SQLWrapper | undefined)[]
) => {
  return findAndCountAll(chatTG)(args, options, ...where);
};

export const getOneChatTG = async <T extends typeof chatTG>(
  args: Partial<T["$inferSelect"]>,
  ...where: (SQLWrapper | undefined)[]
) => {
  return getOne(chatTG)(args, ...where);
};

export const updateOneChatTG = async <T extends typeof chatTG>(
  args: Partial<T["$inferSelect"]>,
  where?: Partial<T["$inferSelect"]>,
  ...rest: (SQLWrapper | undefined)[]
) => {
  return updateOne(chatTG)(args, where, ...rest);
};

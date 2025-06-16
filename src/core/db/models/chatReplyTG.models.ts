import { and, eq } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { drizzle } from "../drizzle";
import { timestamps } from "../utils/timestamps.helpers";
import { chatTG } from "./chatTG.models";

export const chatReplyTG = sqliteTable("chat_reply_tg", {
  id: int().primaryKey({ autoIncrement: true }),
  messageId: int("message_id").notNull().unique(),
  chatId: text("chat_id")
    .notNull()
    .references(() => chatTG.chatId, { onDelete: "cascade" }),
  ...timestamps,
});

export const findOneChatReply = async (
  args: Partial<Omit<typeof chatReplyTG.$inferSelect, keyof typeof timestamps>>,
) => {
  return drizzle
    .select()
    .from(chatReplyTG)
    .where(
      and(
        ...Object.entries(args).map(([key, value]) =>
          eq(chatReplyTG[key as keyof typeof chatReplyTG.$inferSelect], value),
        ),
      ),
    )
    .get();
};

export const updateOneChatReply = async (
  args: Partial<Omit<typeof chatReplyTG.$inferSelect, keyof typeof timestamps>>,
  update: Partial<typeof chatReplyTG.$inferInsert>,
) => {
  return drizzle
    .update(chatReplyTG)
    .set(update)
    .where(
      and(
        ...Object.entries(args).map(([key, value]) =>
          eq(chatReplyTG[key as keyof typeof chatReplyTG.$inferSelect], value),
        ),
      ),
    )
    .returning()
    .get();
};

export const createOneChatReply = async (
  args: Omit<typeof chatReplyTG.$inferInsert, keyof typeof timestamps>,
) => {
  return drizzle.insert(chatReplyTG).values(args).returning().get();
};

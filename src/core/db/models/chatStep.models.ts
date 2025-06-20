import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { timestamps } from "../utils/timestamps.helpers";
import { updateOne } from "../utils/updateOne";
import { chatTG } from "./chatTG.models";

export const chatStep = sqliteTable("chat_step", {
  id: int().primaryKey({ autoIncrement: true }),
  chatId: text("chat_id")
    .notNull()
    .references(() => chatTG.chatId),
  enable: int().notNull().default(0),
  context: text("context", {
    mode: "json",
  })
    .$type<
      Partial<{
        step: string;
        type: "isCallback" | "isCmd" | "isMsg" | "isKeyboard";
        [key: string]: any;
      }>
    >()
    .notNull()
    .default({}),
  ...timestamps,
});

export const updateOneChatStep = async <T extends typeof chatStep>(
  args: T["$inferInsert"],
  where: Partial<T["$inferSelect"]>,
) => {
  return await updateOne(chatStep)(args, where);
};

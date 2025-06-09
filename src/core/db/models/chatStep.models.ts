import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { timestamps } from "../utils/timestamps.helpers";
import { chatReplyTG } from "./chatReplyTG.models";

export const chatStep = sqliteTable("chat_step", {
  id: int().primaryKey({ autoIncrement: true }),
  messageId: int("message_id")
    .notNull()
    .references(() => chatReplyTG.messageId),
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

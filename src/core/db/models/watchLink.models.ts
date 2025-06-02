import { eq, relations } from "drizzle-orm";
import { int, sqliteTable } from "drizzle-orm/sqlite-core";

import { drizzle } from "../drizzle";
import { chatTG } from "./chatTG.models";
import { link } from "./link.models";

export const watchLink = sqliteTable("watch_link", {
  id: int("id").primaryKey({ autoIncrement: true }),
  linkId: int("link_id")
    .references(() => link.id)
    .notNull(),
  chatId: int("chat_id")
    .references(() => chatTG.chatId)
    .notNull(),
  enable: int("enable").notNull().default(1),
});

export const getAllEnableWatchLink = () => {
  return drizzle.select().from(watchLink).where(eq(watchLink.enable, 1)).all();
};

export const watchLinkRelations = relations(watchLink, ({ one }) => ({
  linkId: one(link, {
    fields: [watchLink.linkId],
    references: [link.id],
  }),
  user: one(chatTG, {
    fields: [watchLink.chatId],
    references: [chatTG.chatId],
  }),
}));

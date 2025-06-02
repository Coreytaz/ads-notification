import { eq, relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { drizzle } from "../drizzle";
import { timestamps } from "../utils/timestamps.helpers";
import { chatTG } from "./chatTG.models";
import { sharedLinks } from "./sharedLinks.models";

export const trackedLinks = sqliteTable("tracked_links", {
  id: int("id").primaryKey({ autoIncrement: true }),
  enable: int("enable").notNull().default(1),
  url: text("url").notNull().unique(),
  cronTime: text("cron_time").notNull(),
  chatId: text("chat_id")
    .references(() => chatTG.chatId)
    .notNull(),
  ...timestamps,
});

export const getAllTrackedLinks = () => {
  return drizzle.select().from(trackedLinks).all();
};

export const getTrackedLinkById = (id: number) => {
  return drizzle
    .select()
    .from(trackedLinks)
    .where(eq(trackedLinks.id, id))
    .get();
};

export const trackedLinksRelations = relations(
  trackedLinks,
  ({ one, many }) => ({
    owner: one(chatTG, {
      fields: [trackedLinks.chatId],
      references: [chatTG.chatId],
    }),
    sharedWith: many(sharedLinks),
  }),
);

import { count, eq, inArray, relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { drizzle } from "../drizzle";
import { chatTG } from "./chatTG.models";
import { trackedLinks } from "./trackedLinks.models";

export const sharedLinks = sqliteTable("shared_links", {
  id: int("id").primaryKey({ autoIncrement: true }),
  trackedLinkId: int("tracked_link_id")
    .references(() => trackedLinks.id)
    .notNull(),
  chatId: text("chat_id")
    .references(() => chatTG.chatId)
    .notNull(),
});

export const sharedLinksRelations = relations(sharedLinks, ({ one }) => ({
  trackedLink: one(trackedLinks, {
    fields: [sharedLinks.trackedLinkId],
    references: [trackedLinks.id],
  }),
  user: one(chatTG, {
    fields: [sharedLinks.chatId],
    references: [chatTG.chatId],
  }),
}));

export const getTrackedLinksByChatId = async (
  chatId: string,
  options: { limit: number; offset: number },
) => {
  return drizzle.transaction(async tx => {
    const links = await tx
      .select()
      .from(sharedLinks)
      .where(eq(sharedLinks.chatId, chatId))
      .limit(options.limit)
      .offset(options.offset)
      .all();

    const trackedLinkIds = links.map(link => link.trackedLinkId);

    const total = await tx
      .select({ value: count() })
      .from(sharedLinks)
      .where(eq(sharedLinks.chatId, chatId))
      .then(res => res[0]?.value ?? 0);

    const data = await tx
      .select()
      .from(trackedLinks)
      .where(inArray(trackedLinks.id, trackedLinkIds))
      .all();

    return {
      data,
      total,
    };
  });
};

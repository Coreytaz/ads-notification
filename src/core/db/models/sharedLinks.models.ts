import { count, eq, inArray, relations, SQLWrapper } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { drizzle } from "../drizzle";
import { createOne } from "../utils/createOne";
import { deleteOne } from "../utils/deleteOne";
import { getAll } from "../utils/getAll";
import { getOne } from "../utils/getOne";
import { chatTG } from "./chatTG.models";
import { trackedLinks } from "./trackedLinks.models";

export const sharedLinks = sqliteTable("shared_links", {
  id: int("id").primaryKey({ autoIncrement: true }),
  trackedLinkId: int("tracked_link_id")
    .references(() => trackedLinks.id, { onDelete: "cascade" })
    .notNull(),
  chatId: text("chat_id")
    .references(() => chatTG.chatId, { onDelete: "cascade" })
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

export const getAllSharedLinks = async (
  args: Partial<typeof sharedLinks.$inferSelect>,
  ...rest: (SQLWrapper | undefined)[]
) => {
  return getAll(sharedLinks)(args, ...rest);
};

export const getOneSharedLink = async (
  args: Partial<typeof sharedLinks.$inferSelect>,
) => {
  return getOne(sharedLinks)(args);
};

export const createSharedLink = async (
  args: typeof sharedLinks.$inferInsert,
) => {
  return createOne(sharedLinks)(args);
};

export const deleteSharedLink = async (
  args: Partial<typeof sharedLinks.$inferSelect>,
  ...rest: (SQLWrapper | undefined)[]
) => {
  return deleteOne(sharedLinks)(args, ...rest);
};

export const findAndCountAllTrackedLinksByChatId = async (
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

import { eq, relations, SQLWrapper } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { drizzle } from "../drizzle";
import { createOne } from "../utils/createOne";
import { deleteOne } from "../utils/deleteOne";
import { getAll } from "../utils/getAll";
import { getOne } from "../utils/getOne";
import { timestamps } from "../utils/timestamps.helpers";
import { updateOne } from "../utils/updateOne";
import { chatTG } from "./chatTG.models";
import { sharedLinks } from "./sharedLinks.models";

export const trackedLinks = sqliteTable("tracked_links", {
  id: int("id").primaryKey({ autoIncrement: true }),
  enable: int("enable").notNull().default(1),
  url: text("url").notNull(),
  title: text("title").notNull().default(""),
  cronTime: text("cron_time").notNull(),
  chatId: text("chat_id")
    .references(() => chatTG.chatId, { onDelete: "cascade" })
    .notNull(),
  ...timestamps,
});

export const getAllTrackedLinks = (
  args?: Partial<(typeof trackedLinks)["$inferSelect"]>,
  ...rest: (SQLWrapper | undefined)[]
) => {
  return getAll(trackedLinks)(args, ...rest);
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

export const createOneTrackedLinks = async (
  args: Omit<typeof trackedLinks.$inferInsert, keyof typeof timestamps>,
) => {
  return createOne(trackedLinks)(args);
};

export const deleteOneTrackedLink = async (
  where: Partial<(typeof trackedLinks)["$inferSelect"]>,
) => {
  return deleteOne(trackedLinks)(where);
};

export const getOneTrackedLink = async (
  args: Partial<typeof trackedLinks.$inferSelect>,
) => {
  return getOne(trackedLinks)(args);
};

export const updateOneTrackedLink = async (
  args: Partial<typeof trackedLinks.$inferInsert>,
  where: Partial<typeof trackedLinks.$inferSelect>,
) => {
  return updateOne(trackedLinks)(args, where);
};

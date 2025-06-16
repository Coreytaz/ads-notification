import { eq, relations, SQLWrapper } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { drizzle } from "../drizzle";
import { createOne } from "../utils/createOne";
import { deleteOne } from "../utils/deleteOne";
import { getAll } from "../utils/getAll";
import { getOne } from "../utils/getOne";
import { updateOne } from "../utils/updateOne";
import { chatTG } from "./chatTG.models";
import { link } from "./link.models";

export const watchLink = sqliteTable("watch_link", {
  id: int("id").primaryKey({ autoIncrement: true }),
  linkId: int("link_id")
    .references(() => link.id, { onDelete: "cascade" })
    .notNull(),
  chatId: text("chat_id")
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

export const createOneWatchLink = async (
  args: (typeof watchLink)["$inferInsert"],
) => {
  return createOne(watchLink)(args);
};

export const getOneWatchLink = async (
  args: Partial<(typeof watchLink)["$inferSelect"]>,
) => {
  return getOne(watchLink)(args);
};

export const getAllWatchLink = async (
  args?: Partial<(typeof watchLink)["$inferSelect"]>,
  ...rest: (SQLWrapper | undefined)[]
) => {
  return getAll(watchLink)(args, ...rest);
};

export const deleteOneWatchLink = async (
  args: (typeof watchLink)["$inferInsert"],
) => {
  return deleteOne(watchLink)(args);
};

export const updateOneWatchLink = async (
  args: Partial<(typeof watchLink)["$inferInsert"]>,
  where?: Partial<(typeof watchLink)["$inferSelect"]>,
) => {
  return updateOne(watchLink)(args, where);
};

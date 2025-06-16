import { generateAlphanumericKey } from "@core/utils/generateAlphanumericKey";
import { SQLWrapper } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { createOne } from "../utils/createOne";
import { deleteOne } from "../utils/deleteOne";
import { getOne } from "../utils/getOne";
import { timestamps } from "../utils/timestamps.helpers";
import { trackedLinks } from "./trackedLinks.models";

export const shareKey = sqliteTable("share_key", {
  id: int("id").primaryKey({ autoIncrement: true }),
  trackedLinkId: int("tracked_link_id")
    .references(() => trackedLinks.id, {
      onDelete: "cascade",
    })
    .unique()
    .notNull(),
  key: text("key", { length: 32 })
    .$defaultFn(() => generateAlphanumericKey(32))
    .unique()
    .notNull(),
  ...timestamps,
});

export const createOneShareKey = async (
  args: Omit<typeof shareKey.$inferInsert, keyof typeof timestamps>,
) => {
  return createOne(shareKey)(args);
};

export const getOneShareKey = async (
  args: Partial<typeof shareKey.$inferSelect>,
) => {
  return getOne(shareKey)(args);
};

export const deleteShareKey = async (
  args: Partial<typeof shareKey.$inferSelect>,
  ...rest: (SQLWrapper | undefined)[]
) => {
  return deleteOne(shareKey)(args, ...rest);
};

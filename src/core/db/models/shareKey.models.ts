import crypto from "crypto";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { createOne } from "../utils/createOne";
import { getOne } from "../utils/getOne";
import { timestamps } from "../utils/timestamps.helpers";
import { trackedLinks } from "./trackedLinks.models";

function generateAlphanumericKey(length = 32) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "";
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    const index = randomBytes[i] % chars.length;
    key += chars[index];
  }
  return key;
}

export const shareKey = sqliteTable("share_key", {
  id: int("id").primaryKey({ autoIncrement: true }),
  trackedLinkId: int("tracked_link_id")
    .references(() => trackedLinks.id)
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

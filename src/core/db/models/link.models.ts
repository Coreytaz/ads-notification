import { inArray, relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { drizzle } from "../drizzle";
import { timestamps } from "../utils/timestamps.helpers";
import { trackedLinks } from "./trackedLinks.models";

export const link = sqliteTable("link", {
  id: int("id").primaryKey({ autoIncrement: true }),
  trackedLinkId: int("tracked_link_id").references(() => trackedLinks.id, {
    onDelete: "cascade",
  }),
  url: text("url"),
  title: text("title"),
  price: text("price"),
  square: text("square"),
  address: text("address"),
  house: text("house"),
  seller_name: text("seller_name"),
  small_description: text("small_description"),
  floor: text("floor"),
  floor_count: text("floor_count"),
  date_published: text("date_published"),
  hash: text("content_hash").notNull().unique(),
  ...timestamps,
});

export const linkRelations = relations(link, ({ one }) => ({
  trackedLink: one(trackedLinks, {
    fields: [link.trackedLinkId],
    references: [trackedLinks.id],
  }),
}));

export const reduceIds = <T extends { id: number }>(
  links: T[],
): Record<string, T> => {
  return links.reduce<Record<string, T>>((acc, link) => {
    acc[String(link.id)] = link;
    return acc;
  }, {});
};

export const getLinkByIds = (linkIds: number[]) => {
  return drizzle.select().from(link).where(inArray(link.id, linkIds)).all();
};

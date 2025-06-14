import { eq, type SQLWrapper } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { drizzle } from "../drizzle";
import { getAll } from "../utils/getAll";
import { timestamps } from "../utils/timestamps.helpers";

export const ChatType = {
  private: "private",
  group: "group",
  supergroup: "supergroup",
  channel: "channel",
} as const;

export type ChatType = (typeof ChatType)[keyof typeof ChatType];

export const typeTG = sqliteTable("type_tg", {
  id: int("id").primaryKey({ autoIncrement: true }),
  name: text("name", {
    enum: [
      ChatType.private,
      ChatType.group,
      ChatType.supergroup,
      ChatType.channel,
    ],
  })
    .$type<ChatType>()
    .notNull(),
  enable: int("enable").notNull().default(1),
  ...timestamps,
});

export const getOneTypeByName = async (name: ChatType) => {
  return drizzle.select().from(typeTG).where(eq(typeTG.name, name)).get();
};

export const getAllTypeTG = async (
  args: Partial<typeof typeTG.$inferSelect>,
  ...where: (SQLWrapper | undefined)[]
) => {
  return getAll(typeTG)(args, ...where);
};

import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { timestamps } from "../utils/timestamps.helpers";

export const role = sqliteTable("role", {
    id: int().primaryKey({ autoIncrement: true }),
    name: text().notNull().unique(),
    ...timestamps,
});
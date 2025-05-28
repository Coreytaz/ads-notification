import { relations } from "drizzle-orm";
import { int, sqliteTable } from "drizzle-orm/sqlite-core";

import { chatTG } from "./chatTG.models";
import { trackedLinks } from "./trackedLinks.models";

export const sharedLinks = sqliteTable("shared_links", {
    id: int("id").primaryKey({ autoIncrement: true }),
    trackedLinkId: int("tracked_link_id").references(() => trackedLinks.id).notNull(),
    chatId: int("chat_id").references(() => chatTG.chatId).notNull(),
    canEdit: int("can_edit").notNull().default(0),
    sharedAt: int("shared_at", { mode: "timestamp" }).notNull(),
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
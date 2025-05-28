import logger from "@core/utils/logger";
import { eq } from "drizzle-orm";

import { drizzle } from "../drizzle";
import { chatTG } from "../models";

const initialData: typeof chatTG.$inferInsert[] = [{
    chatId: "1221893505",
    roleId: 1,
    name: "gamy1337"
}];

export default async function seedDefaultConfig() {
    try {
        const existingConfigs = await drizzle.select().from(chatTG).where(eq(chatTG.chatId, "1221893505")).all();

        if (existingConfigs.length > 0) {
            logger.info("ChatTg admin already exists, skipping seeding.");
            return;
        }

        await drizzle.insert(chatTG).values(initialData).run();

        logger.info("ChatTg admin seeded successfully!");
    } catch (error) {
        logger.error("Error seeding default config:", error);
        throw error;
    }
}
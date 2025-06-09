import logger from "@core/utils/logger";

import { drizzle } from "../drizzle";
import { typeTG } from "../models";

const initialData: (typeof typeTG.$inferInsert)[] = [
  {
    name: "channel",
    enable: 0,
  },
  {
    name: "group",
    enable: 0,
  },
  {
    name: "private",
    enable: 1,
  },
  {
    name: "supergroup",
    enable: 0,
  },
];

export default async function seedDefaultConfig() {
  try {
    const existingConfigs = await drizzle.select().from(typeTG).all();

    if (existingConfigs.length > 0) {
      logger.info("typeTG already exists, skipping seeding.");
      return;
    }

    for (const config of initialData) {
      await drizzle.insert(typeTG).values(config).run();
    }

    logger.info("typeTG seeded successfully!");
  } catch (error) {
    logger.error("Error seeding default config:", error);
    throw error;
  }
}

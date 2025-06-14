import logger from "@core/utils/logger";

import { drizzle } from "../drizzle";
import { role } from "../models";

const initialData: (typeof role.$inferInsert)[] = [
  {
    id: 1,
    name: "Admin",
  },
  {
    id: 2,
    name: "User",
  },
  {
    id: 3,
    name: "Guest",
  },
  {
    id: 4,
    name: "Moderator",
  },
];

export default async function seedDefaultConfig() {
  try {
    const existingConfigs = await drizzle.select().from(role).all();

    if (existingConfigs.length > 0) {
      logger.info("Role already exists, skipping seeding.");
      return;
    }

    // Вставляем начальные данные
    for (const config of initialData) {
      await drizzle.insert(role).values(config).run();
    }

    logger.info("Role seeded successfully!");
  } catch (error) {
    logger.error("Error seeding default config:", error);
    throw error;
  }
}

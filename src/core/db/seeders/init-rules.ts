import logger from "@core/utils/logger";

import { drizzle } from "../drizzle";
import { rules } from "../models";

const initialData: string[] = [
  ...new Set([
    "*",
    "/start",
    "/id",
    "/menu",
    "/reset",
    "main/categories",
    "main/system",
    "main/subscribe",
    "browser/back",
    "browser/toggle",
    "roleUsers/changeRoleEnd",
    "roleUsers/changeRole",
    "roleUsers/user",
    "roleUsers/back",
    "system/browser",
    "system/roleUsers",
    "system/back",
    "subscribe/create",
    "subscribe/list",
    "subscribe/back",
    "categories/add",
    "categories/list",
    "categories/sharedList",
    "categories/back",
    "shared/back",
    "sharedDetail/create",
    "sharedDetail/back",
    "editCron/back",
    "editUrl/back",
    "detailList/shared",
    "detailList/editCron",
    "detailList/editUrl",
    "detailList/back",
    "detailList/edit",
    "detailList/delete",
    "detailList/detail",
    "detailList/back",
    "detailShared/unsubcribe",
    "detailShared/back",
    "sharedDetail/delete",
    "categoriesSharedList/back",
    "categories/add/back",
    "detailShared/detail",
    "categoriesList/back",
    "detailList/toggle",
    "detailList/editTitle",
    "watchLink/toggle",
  ]),
];

export default async function seedDefaultConfig() {
  try {
    const existingConfigs = await drizzle.select().from(rules).all();

    if (existingConfigs.length > 0) {
      logger.info("Role already exists, skipping seeding.");
      return;
    }

    await drizzle
      .insert(rules)
      .values(
        initialData.map(config => ({
          route: config,
        })),
      )
      .run();

    logger.info("Role seeded successfully!");
  } catch (error) {
    logger.error("Error seeding default config:", error);
    throw error;
  }
}

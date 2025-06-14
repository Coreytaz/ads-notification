import config from "@config/config";
import consts from "@config/consts";
import logger from "@core/utils/logger";
import path from "path";
import { pathToFileURL } from "url";

async function runSeeder(seederName: string) {
  const ext = config.isDev ? ".ts" : ".js";
  const folder = config.isDev ? "src" : "dist";

  const seederPath = path.join(
    consts.DIRNAME,
    folder,
    "core",
    "db",
    "seeders",
    `${seederName}${ext}`,
  );

  const seederUrl = pathToFileURL(seederPath).href;

  const seederModule = await import(seederUrl);

  if (typeof seederModule.default === "function") {
    await seederModule.default();
  } else {
    throw new Error(`Seeder ${seederName} does not export a default function.`);
  }
}

export async function runInitialSeeders() {
  try {
    const seeders: string[] = [
      "init-roles",
      "init-admin-chatTg",
      "init-typeTg",
      "init-rules",
      "init-permissions",
    ];

    logger.info("Starting seeders execution...");
    for (const seeder of seeders) {
      await runSeeder(seeder);
    }
    logger.info("All seeders executed successfully");
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error executing seeders: ${error.message}`);
    }
    throw error;
  }
}

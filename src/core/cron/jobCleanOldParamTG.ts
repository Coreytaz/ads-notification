import { drizzle } from "@core/db";
import { paramsTG } from "@core/db/models";
import logger from "@core/utils/logger.js";
import { CronJob } from "cron";
import { lt } from "drizzle-orm";

async function cleanOldParamTG() {
  logger.info(
    "------------- Старт очистки старых записей ParamsTG -------------",
  );

  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oneDayAgoISO = oneDayAgo.toISOString();

    await drizzle
      .delete(paramsTG)
      .where(lt(paramsTG.created_at, oneDayAgoISO))
      .execute();

    logger.info(
      "------------- Успешная очистка старых записей ParamsTG -------------",
    );
  } catch (error) {
    logger.error("Ошибка при очистке старых записей ParamsTG:", error);
    throw error;
  }
}

const jobCleanOldParamTG = new CronJob(
  "0 0 * * *", // один раз в день - каждый день в полночь
  cleanOldParamTG,
  null,
  false,
  "Europe/Moscow",
);

export { jobCleanOldParamTG };

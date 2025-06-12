import { drizzle } from "@core/db";
import { chatStep } from "@core/db/models/chatStep.models";
import logger from "@core/utils/logger.js";
import { CronJob } from "cron";
import { lt } from "drizzle-orm";

async function toggleOldStepTG() {
  logger.info(
    "------------- Старт очистки старых записей StepTG -------------",
  );

  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oneDayAgoISO = oneDayAgo.toISOString();

    await drizzle
      .delete(chatStep)
      .where(lt(chatStep.created_at, oneDayAgoISO))
      .execute();

    logger.info(
      "------------- Успешная очистка старых записей StepTG -------------",
    );
  } catch (error) {
    logger.error("Ошибка при очистке старых записей StepTG:", error);
    throw error;
  }
}

const jobToggleOldStepTG = new CronJob(
  "0 0 * * *",
  toggleOldStepTG,
  null,
  false,
  "Europe/Moscow",
);

export { jobToggleOldStepTG };

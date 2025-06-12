import { drizzle } from "@core/db";
import { chatReplyTG } from "@core/db/models";
import logger from "@core/utils/logger.js";
import { CronJob } from "cron";
import { lt } from "drizzle-orm";

async function cleanOldChatReplyEditTG() {
  logger.info(
    "------------- Старт очистки старых записей ChatReplyEditTg -------------",
  );

  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oneDayAgoISO = oneDayAgo.toISOString();

    await drizzle
      .delete(chatReplyTG)
      .where(lt(chatReplyTG.created_at, oneDayAgoISO))
      .execute();

    logger.info(
      "------------- Успешная очистка старых записей ChatReplyEditTg -------------",
    );
  } catch (error) {
    logger.error("Ошибка при очистке старых записей ChatReplyEditTg:", error);
    throw error;
  }
}

const jobCleanOldChatReplyEditTG = new CronJob(
  "0 0 * * *", // один раз в день - каждый день в полночь
  cleanOldChatReplyEditTG,
  null,
  false,
  "Europe/Moscow",
);

export { jobCleanOldChatReplyEditTG };

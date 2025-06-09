import logger from "@core/utils/logger";
import { commands } from "@grammyjs/commands";
import { run, RunnerHandle } from "@grammyjs/runner";
import { ignoreOld, sequentialize } from "grammy-middlewares";

import { bot } from "./core";
import {
  editAndReply,
  identify,
  router,
  steps,
  typeCheck,
  userCheck,
} from "./core/middlewares";

let runner: RunnerHandle;

async function runBot() {
  logger.info("Запуск бота...");

  bot
    .use(sequentialize())
    .use(ignoreOld())
    .use(commands())

    .use(typeCheck)
    .use(editAndReply)
    .use(identify)
    .use(steps)
    .use(userCheck)
    .use(router);

  bot.catch(logger.error);

  await bot.init();
  runner = run(bot);
  logger.info(`Бот ${bot.botInfo.username} запущен и работает`);
}

async function stopBot() {
  logger.info("Остановка бота...");
  if (runner.isRunning()) {
    await bot.stop();
  }
  logger.info("Бот остановлен");
}

export { runBot, stopBot };

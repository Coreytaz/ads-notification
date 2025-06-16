import { Server } from "node:http";

import app from "@app";
import config from "@config/config";
import { stopBot } from "@core/bot";
import { loggerTG } from "@core/bot/core/utils/logger";
import errorHandler from "@core/utils/errorHandler";
import logger from "@core/utils/logger";

const { port } = config;

const server: Server = app.listen(port, (): void => {
  logger.info(`Приложение слушает PORT: ${port}`);
});

const exitHandler = (): void => {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  server.close(async () => {
    await loggerTG.error("Server closed");
    await stopBot();
    logger.info("Server closed");
    process.exit(1);
  });
};

const unexpectedErrorHandler = (error: Error): void => {
  errorHandler.handleError(error);
  if (!errorHandler.isTrustedError(error)) {
    exitHandler();
  }
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", (reason: Error) => {
  throw reason;
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received");
  server.close();
});

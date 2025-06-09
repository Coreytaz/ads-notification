import logger from "@core/utils/logger";
import { NextFunction } from "grammy";

import { Context } from "../interface/Context";
import ErrorBot from "../utils/ErrorBot";
import { loggerTG } from "../utils/logger";

export default async function message(ctx: Context, next: NextFunction) {
  try {
    logger.debug(`isMsg = ${ctx.isMsg}`);

    if (!ctx.isMsg) {
      throw new ErrorBot("Нет прав доступа!", ctx, true);
    }

    if (!Boolean(ctx.configUser.enable)) {
      throw new ErrorBot("Нет прав доступа!", ctx, true);
    }

    await next();
    return;
  } catch (error) {
    logger.info(error instanceof Error ? error.message : String(error));
    void loggerTG.error(error instanceof Error ? error.message : String(error));
  }
}

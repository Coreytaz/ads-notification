import logger from "@core/utils/logger.js";
import type { NextFunction } from "grammy";

import { Context } from "../interface/Context.js";
import callbackQuery from "./callbackQuery.middleware.js";
import commands from "./commands.middleware.js";
import message from "./message.middleware.js";
import update from "./update.middleware.js";

export default async function router(ctx: Context, next: NextFunction) {
  try {
    // if (await ctx.step.isActive()) {
    //   const step = await ctx.step.findStep();
    //   if (step) {
    //     ctx[step.type] = true;
    //   }
    // }
    if (ctx.isCallback) {
      await update(ctx, next);
      return;
    }
    if (ctx.isKeyboard) {
      await callbackQuery(ctx, next);
      return;
    }
    if (ctx.isCmd) {
      await commands(ctx, next);
      return;
    }
    if (ctx.isMsg) {
      await message(ctx, next);
      return;
    }
    await next();
  } catch (error) {
    if (error instanceof Error) {
      logger.info(error.message);
    } else {
      logger.info(String(error));
    }
  }
}

/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import logger from "@core/utils/logger";
import type { Command } from "@grammyjs/commands";
import type { NextFunction } from "grammy";

import cmds from "../../commands";
import { Context } from "../interface/Context";
import ErrorBot from "../utils/ErrorBot";

const myCommands = (cmds: Record<string, Command>) => {
  return Object.values(cmds).map(command => ({
    command: command.stringName,
    description: command.description,
  }));
};

const returnCommandHelper = async (
  command: string,
  ctx: Context,
  next: NextFunction,
) => {
  const commandFunc = cmds[command] ?? null;
  if (!commandFunc) throw new ErrorBot("Данной команды нету!", ctx, true);
  await ctx.api.setMyCommands(myCommands(cmds));
  await commandFunc.middleware()(ctx, next);
};

export default async function commands(ctx: Context, next: NextFunction) {
  try {
    logger.debug(`isCmd = ${ctx.isCmd}`);

    if (!ctx.isCmd) {
      throw new ErrorBot("Нет прав доступа!", ctx, true);
    }

    if (!Boolean(ctx.configUser.enable)) {
      throw new ErrorBot("Нет прав доступа!", ctx, true);
    }

    const command = ctx.message?.text?.split("@")[0];
    const pointRoute = ctx.rules["*"];

    if (pointRoute) {
      if (pointRoute.route === "*" && pointRoute.enable) {
        await returnCommandHelper(command!, ctx, next);
        return;
      }
    }

    const rule = ctx.rules[command!];

    if (!rule) {
      throw new ErrorBot("Нет прав доступа!", ctx, true);
    }

    if (!rule.enable) {
      throw new ErrorBot("Нет прав доступа!", ctx, true);
    }

    await returnCommandHelper(command!, ctx, next);
    return;
  } catch (error) {
    logger.info(error instanceof Error ? error.message : String(error));
  }
}

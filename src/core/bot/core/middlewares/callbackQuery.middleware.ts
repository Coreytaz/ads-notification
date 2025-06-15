/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { isEmpty } from "@core/utils/isEmpty";
import logger from "@core/utils/logger";
import { NextFunction } from "grammy";

import cbQuery from "../../callbackQuery";
import { Context } from "../interface/Context";
import ErrorBot from "../utils/ErrorBot";
import { ParamsExtractorDB } from "../utils/paramsExractorDB";

const returnCallbackQueryHelper = async (
  route: string,
  ctx: Context,
  next: NextFunction,
) => {
  const cbQueryFunc = cbQuery[route] ?? null;
  if (!cbQueryFunc) throw new ErrorBot("Данной команды нету!", ctx, true);
  await cbQueryFunc(ctx, next);
};

export default async function callbackQuery(ctx: Context, next: NextFunction) {
  try {
    logger.debug(`isKeyboard = ${ctx.isKeyboard}`);

    if (!ctx.isKeyboard) {
      throw new ErrorBot("Нет прав доступа!", ctx, true);
    }

    if (!Boolean(ctx.configUser.enable)) {
      throw new ErrorBot("Нет прав доступа!", ctx, true);
    }

    const data = (await ctx.step.isActive())
      ? ctx.step.context()?.step
      : ctx.callbackQuery?.data;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const params = new ParamsExtractorDB(data!);
    ctx.paramsExtractor = params;

    if (!isEmpty(params.params[params.key_db])) {
      const dbParams = await params.getParamsDB(params.params[params.key_db]);
      params.addParams(dbParams as Record<string, string | number | boolean>);
    }

    const route = params.route;
    const pointRoute = ctx.rules["*"];

    console.log("route", route);

    if (pointRoute) {
      if (pointRoute.route === "*" && pointRoute.enable) {
        await returnCallbackQueryHelper(route, ctx, next);
        return;
      }
    }

    const rule = ctx.rules[route];

    if (!rule) {
      throw new ErrorBot("Нет прав доступа!", ctx, true);
    }

    if (!rule.enable) {
      throw new ErrorBot("Нет прав доступа!", ctx, true);
    }

    await returnCallbackQueryHelper(route, ctx, next);
    return;
  } catch (error) {
    logger.error(error);
    if (ctx.callbackQuery) {
      await ctx?.answerCallbackQuery?.();
    }
  }
}

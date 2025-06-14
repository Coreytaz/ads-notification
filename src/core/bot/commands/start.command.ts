import { mapping } from "@core/utils/mapping";
import { Command } from "@grammyjs/commands";
import { NextFunction } from "grammy";

import type { Context } from "../core/interface/Context";
import { loggerTG } from "../core/utils/logger";
import { sharedUrl } from "../ref/sharedUrl";

type RefKey = "shared_url";

const mapRef: Record<
  RefKey,
  (ctx: Context, next: NextFunction, ref_value: string | null) => Promise<void>
> = {
  shared_url: sharedUrl,
};

export const startCommand = new Command<Context>(
  "start",
  "Старт бота",
  async (ctx: Context, next) => {
    if (!ctx.referralLink) {
      await ctx.reply(
        "Привет! Я бот для уведомлений о новых объявлениях на сайте (Для того чтобы открыть меню напишите /menu)",
      );
      return;
    }

    const [ref_key = null, ref_value = null] = ctx.referralLink
      .trim()
      .split("=") as [string, string];

    if (!ref_key) {
      void loggerTG.info(
        `Не удалось определить ключ реферальной ссылки ${ref_key}: ${ref_value}`,
      );
      return next();
    }

    await mapping(ref_key, mapRef, () => next(), ctx, next, ref_value);
  },
);

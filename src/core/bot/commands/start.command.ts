import { Command } from "@grammyjs/commands";

import type { Context } from "../core/interface/Context";

export const startCommand = new Command<Context>(
  "start",
  "Старт бота",
  async (ctx: Context) => {
    await ctx.reply(
      "Привет! Я бот для уведомлений о новых объявлениях на сайте (Для того чтобы открыть меню напишите /menu)",
    );
  },
);

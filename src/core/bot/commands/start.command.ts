import { Command } from "@grammyjs/commands";

import type { Context } from "../core/interface/Context";

// const mapTypeChat: Record<
//   "private",
//   (ctx: Context, next: NextFunction) => Promise<void>
// > = {
//   private: async ctx => {
//     await ctx.reply(
//       "Привет! Я бот Гамуйник для уведомлений о новых постах на сайте (Для того чтобы открыть меню напишите /menu)",
//     );
//   },
// };

export const startCommand = new Command<Context>(
  "start",
  "Старт бота",
  async (ctx: Context) => {
    await ctx.reply(
      "Привет! Я бот Гамуйник для уведомлений о новых постах на сайте (Для того чтобы открыть меню напишите /menu)",
    );
  },
);

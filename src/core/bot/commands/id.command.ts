import { Command } from "@grammyjs/commands";

import { Context } from "../core/interface/Context";

export const idCommand = new Command<Context>(
  "id",
  "Получить свой id",
  async ctx => {
    await ctx.reply(`Ваш id:${ctx.from?.id}`);
  },
);

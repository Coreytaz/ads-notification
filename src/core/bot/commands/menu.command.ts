import { Command } from "@grammyjs/commands";

import { Context } from "../core/interface/Context";
import { mainMenu } from "../menu/main";

export const menuCommand = new Command<Context>(
  "menu",
  "Открыть меню",
  async ctx => {
    await ctx.editAndReply.reply("Главное меню", {
      reply_markup: mainMenu(ctx),
    });
  },
);

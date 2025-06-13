import { updateOneChatStep } from "@core/db/models/chatStep.models";
import { Command } from "@grammyjs/commands";

import { Context } from "../core/interface/Context";
import { mainMenu } from "../menu/main";

export const resetCommand = new Command<Context>(
  "reset",
  "Cбросить настройки (Если что-то не работает)",
  async ctx => {
    await updateOneChatStep({ chatId: String(ctx.chat.id) }, { enable: 0 });

    await ctx.reply("Главное меню", {
      reply_markup: mainMenu(ctx),
    });
  },
);

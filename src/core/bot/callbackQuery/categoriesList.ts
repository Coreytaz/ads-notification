import { InlineKeyboard } from "grammy";

import { Context } from "../core/interface/Context";

export const categoriesList = async (ctx: Context) => {
  await ctx.answerCallbackQuery();

  const mainMenu = new InlineKeyboard();

  mainMenu.text("Назад", "main/categories").row();

  await ctx.editAndReply.reply("Cписок категорий", {
    reply_markup: mainMenu,
  });
};

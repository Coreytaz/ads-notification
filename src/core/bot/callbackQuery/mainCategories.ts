import { Context } from "../core/interface/Context";
import { categoriesMenu } from "../menu/categories";

export const mainCategories = async (ctx: Context) => {
  if (ctx.callbackQuery) {
    await ctx.answerCallbackQuery();
  }

  await ctx.editAndReply.reply("Меню категорий", {
    reply_markup: categoriesMenu(ctx),
  });
};

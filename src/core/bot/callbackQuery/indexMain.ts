import { Context } from "../core/interface/Context";
import { mainMenu } from "../menu/main";

export const indexMain = async (ctx: Context) => {
  await ctx.answerCallbackQuery();
  await ctx.editAndReply.reply("Главное меню", {
    reply_markup: mainMenu(ctx),
  });
};

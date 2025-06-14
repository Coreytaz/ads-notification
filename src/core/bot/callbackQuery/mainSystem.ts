import { Context } from "../core/interface/Context";
import { systemMenu } from "../menu/system";

export const mainSystem = async (ctx: Context) => {
  await ctx.answerCallbackQuery();
  await ctx.editAndReply.reply("Системные настройки", {
    reply_markup: systemMenu(ctx),
  });
};

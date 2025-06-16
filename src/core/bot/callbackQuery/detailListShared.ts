import { InlineKeyboard } from "grammy";

import { Context } from "../core/interface/Context";
import { menuButton } from "../menu/menuButton.config";

export const detailListShared = async (ctx: Context) => {
  const menu = new InlineKeyboard();

  menu
    .text(
      menuButton.sharedDetail.create.label,
      ctx.paramsExtractor?.toStringDB({
        route: menuButton.sharedDetail.create.data,
      }),
    )
    .row();

  menu
    .text(
      menuButton.sharedDetail.delete.label,
      ctx.paramsExtractor?.toStringDB({
        route: menuButton.sharedDetail.delete.data,
      }),
    )
    .row();

  const { data, label } = menuButton.sharedDetail.back;

  menu.text(label, ctx.paramsExtractor?.toStringDB({ route: data })).row();

  if (ctx.callbackQuery) {
    await ctx.answerCallbackQuery();
  }

  await ctx.editAndReply.reply("Управление общим доступом", {
    reply_markup: menu,
  });
};

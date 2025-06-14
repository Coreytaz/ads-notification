import { getTrackedLinkById } from "@core/db/models";
import { InlineKeyboard } from "grammy";

import { Context } from "../core/interface/Context";
import { menuButton } from "../menu/menuButton.config";

export const detailListShared = async (ctx: Context) => {
  const params = ctx.paramsExtractor?.params ?? {};
  const linkId = params.linkId as string;

  const menu = new InlineKeyboard();

  const link = await getTrackedLinkById(Number(linkId));

  menu
    .text(
      menuButton.sharedDetail.create.label,
      ctx.paramsExtractor?.toStringDB({
        route: menuButton.sharedDetail.create.data,
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

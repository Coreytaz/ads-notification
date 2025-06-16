import { cronControllerAds } from "@components/ads-check/ads-check.cron";
import { updateOneTrackedLink } from "@core/db/models";
import { InlineKeyboard, type NextFunction } from "grammy";

import { Context } from "../core/interface/Context";
import commands from "../core/middlewares/commands.middleware";
import { isCommand } from "../core/utils/isCommand";
import { menuButton } from "../menu/menuButton.config";
import { detailListDetail } from "./detailListDetail";

export const detailListEditTitle = async (ctx: Context, next: NextFunction) => {
  const params = ctx.paramsExtractor?.params ?? {};
  const linkId = params.linkId as string;

  const { data, label } = menuButton.editUrl.back;

  if (ctx.callbackQuery?.data === data) {
    await ctx.step.toggleStep(false);
    return detailListDetail(ctx);
  }

  const msg = ctx.message?.text;

  const menu = new InlineKeyboard();

  menu.text(label, data);

  if (msg) {
    if (isCommand(msg)) {
      await ctx.step.toggleStep(false);
      await commands(ctx, next);
      return;
    }

    await updateOneTrackedLink(
      {
        title: msg,
      },
      {
        id: Number(linkId),
      },
    ).then(config => {
      cronControllerAds.changeConfig(config);
    });

    await ctx.step.toggleStep(false);
    return detailListDetail(ctx);
  }

  await ctx.step.saveStep(true, {
    step: ctx.paramsExtractor?.toStringDB({
      route: menuButton.detailList.editTitle.data,
    }),
  });

  if (ctx.callbackQuery) {
    await ctx.answerCallbackQuery();
  }

  await ctx.editAndReply.reply(
    "Введите новое название категории, которое будет отображаться в списке.",
    {
      reply_markup: menu,
    },
  );
};

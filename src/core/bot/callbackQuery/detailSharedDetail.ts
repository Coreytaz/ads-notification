import { getTrackedLinkById } from "@core/db/models";
import { InlineKeyboard } from "grammy";

import { Context } from "../core/interface/Context";
import { objectToText } from "../core/utils/objectToText";
import { menuButton } from "../menu/menuButton.config";

const mapCron = {
  "*/5 * * * *": "каждые 5 минут",
  "*/10 * * * *": "каждые 10 минут",
  "*/30 * * * *": "каждые 30 минут",
};

const buttons = [
  {
    label: menuButton.detailShared.unsubcribe.label,
    route: menuButton.detailShared.unsubcribe.data,
  },
];

export const detailSharedDetail = async (ctx: Context) => {
  const params = ctx.paramsExtractor?.params ?? {};
  const linkId = params.sharedLink as string;

  const menu = new InlineKeyboard();

  const link = await getTrackedLinkById(Number(linkId));

  buttons.forEach(btn => {
    menu
      .text(
        btn.label,
        ctx.paramsExtractor?.toStringDB({
          route: btn.route,
        }),
      )
      .row();
  });

  const { data, label } = menuButton.detailShared.back;

  menu.text(label, data).row();

  if (ctx.callbackQuery) {
    await ctx.answerCallbackQuery();
  }

  await ctx.editAndReply.reply(
    objectToText({
      title: { label: "Название категории", value: link?.title },
      cronTime: {
        label: "Время запуска",
        value: mapCron[link?.cronTime as keyof typeof mapCron],
      },
      url: { label: "Ссылка", value: link?.url },
    }),
    {
      reply_markup: menu,
    },
  );
};

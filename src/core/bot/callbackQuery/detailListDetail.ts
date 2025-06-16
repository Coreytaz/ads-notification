import { cronControllerAds } from "@components/ads-check/ads-check.cron";
import { getTrackedLinkById, updateOneTrackedLink } from "@core/db/models";
import { InlineKeyboard } from "grammy";

import { Context } from "../core/interface/Context";
import { objectToText } from "../core/utils/objectToText";
import { ParamsExtractorDB } from "../core/utils/paramsExractorDB";
import { menuButton } from "../menu/menuButton.config";

const mapCron = {
  "*/1 * * * *": "каждую 1 минуту",
  "*/5 * * * *": "каждые 5 минут",
  "*/10 * * * *": "каждые 10 минут",
  "*/30 * * * *": "каждые 30 минут",
};

const buttons = [
  {
    label: menuButton.detailList.editUrl.label,
    route: menuButton.detailList.editUrl.data,
  },
  {
    label: menuButton.detailList.editTitle.label,
    route: menuButton.detailList.editTitle.data,
  },
  {
    label: menuButton.detailList.editCron.label,
    route: menuButton.detailList.editCron.data,
  },
  {
    label: menuButton.detailList.shared.label,
    route: menuButton.detailList.shared.data,
  },
  {
    label: menuButton.detailList.delete.label,
    route: menuButton.detailList.delete.data,
  },
];

export const detailListDetail = async (ctx: Context) => {
  const params = ctx.paramsExtractor?.params ?? {};
  const linkId = params.linkId as string;
  const toggle = params.toggle as "true" | "false";

  if (toggle === "true") {
    await updateOneTrackedLink(
      {
        enable: 1,
      },
      {
        id: Number(linkId),
      },
    ).then(async config => {
      await cronControllerAds.toggle(config);
    });
  }
  if (toggle === "false") {
    await updateOneTrackedLink(
      {
        enable: 0,
      },
      {
        id: Number(linkId),
      },
    ).then(async config => {
      await cronControllerAds.toggle(config);
    });
  }

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

  const active = link?.enable;

  const status = active ? "🔕" : "🔔";

  const newParams = new ParamsExtractorDB(menuButton.detailList.toggle.data);
  newParams.addParams({
    linkId: linkId,
    toggle: active ? "false" : "true",
  });
  menu
    .text(
      `${status} (${active ? "Выключить" : "Включить"})`,
      await newParams.toStringAsync(),
    )
    .row();

  const { data, label } = menuButton.detailList.back;

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

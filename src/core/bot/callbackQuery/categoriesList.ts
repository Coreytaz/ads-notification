import { trackedLinks } from "@core/db/models";
import { findAndCountAll } from "@core/db/utils/findAndCountAll";
import { InlineKeyboard } from "grammy";

import { Context } from "../core/interface/Context";
import { createPagination } from "../core/utils/pagination";
import { ParamsExtractorDB } from "../core/utils/paramsExractorDB";
import { menuButton } from "../menu/menuButton.config";

export const categoriesList = async (ctx: Context) => {
  const params = ctx.paramsExtractor?.params ?? {};
  const page = Number(params?.page) || 1;
  const limit = 5;

  const menu = new InlineKeyboard();

  const { data, label } = menuButton.categoriesList.back;

  const { data: links, total: count } = await findAndCountAll(trackedLinks)(
    {
      chatId: String(ctx.chat?.id),
    },
    {
      offset: (page - 1) * limit,
      limit,
    },
  );

  for (const link of links) {
    const params = new ParamsExtractorDB(menuButton.detailShared.detail.data);

    params.addParam("sharedLink", link.id);

    const title = link.title || link.url || "Без названия";

    menu
      .text(
        "ID:" + String(link.id) + " - (" + String(title.slice(0, 30)) + ")",
        params.toString(),
      )
      .row();
  }

  await createPagination({
    count: Math.ceil(count / limit),
    page,
    menu,
    route: menuButton.categories.list.data,
    params,
  });

  menu.text(label, data).row();

  await ctx.answerCallbackQuery();

  await ctx.editAndReply.reply("Cписок ваших категорий", {
    reply_markup: menu,
  });
};

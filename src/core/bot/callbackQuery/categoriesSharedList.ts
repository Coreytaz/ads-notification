import { getTrackedLinksByChatId } from "@core/db/models";
import { InlineKeyboard } from "grammy";

import { Context } from "../core/interface/Context";
import { createPagination } from "../core/utils/pagination";
import { ParamsExtractorDB } from "../core/utils/paramsExractorDB";
import { menuButton } from "../menu/menuButton.config";

export const categoriesSharedList = async (ctx: Context) => {
  const params = ctx.paramsExtractor?.params ?? {};
  const page = Number(params?.page) || 1;
  const limit = 5;

  const menu = new InlineKeyboard();

  const { data, label } = menuButton.categoriesSharedList.back;

  const { data: sharedLinks, total: count } = await getTrackedLinksByChatId(
    String(ctx.chat?.id),
    {
      offset: (page - 1) * limit,
      limit,
    },
  );

  for (const sharedLink of sharedLinks) {
    const params = new ParamsExtractorDB(menuButton.detailShared.detail.data);

    params.addParam("sharedLink", sharedLink.id);

    menu
      .text(
        "ID:" +
          String(sharedLink.id) +
          " - (" +
          String(sharedLink.url.slice(0, 10)) +
          ")",
        params.toString(),
      )
      .row();
  }

  await createPagination({
    count: Math.ceil(count / limit),
    page,
    menu,
    route: menuButton.categories.sharedList.data,
    params,
  });

  menu.text(label, data).row();

  await ctx.answerCallbackQuery();

  await ctx.editAndReply.reply("Совместный список категорий", {
    reply_markup: menu,
  });
};

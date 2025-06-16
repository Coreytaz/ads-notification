import {
  createOneWatchLink,
  getOneWatchLink,
  updateOneWatchLink,
} from "@core/db/models";
import { InlineKeyboard } from "grammy";

import { Context } from "../core/interface/Context";
import { ParamsExtractorDB } from "../core/utils/paramsExractorDB";
import { menuButton } from "../menu/menuButton.config";

export const watchLinkToggle = async (ctx: Context) => {
  const params = ctx.paramsExtractor?.params ?? {};
  const linkId = params.linkId as string;
  const watchLinkId = params.watchLinkId as string | undefined;

  const toggle = params.toggle as "true" | "false";

  if (toggle === "true") {
    await updateOneWatchLink(
      {
        enable: 1,
      },
      {
        id: watchLinkId ? Number(watchLinkId) : undefined,
        linkId: Number(linkId),
        chatId: String(ctx.from?.id),
      },
    ).then(async config => {
      // await cronControllerAds.toggle(config);
    });
  }
  if (toggle === "false") {
    await updateOneWatchLink(
      {
        enable: 0,
      },
      {
        id: watchLinkId ? Number(watchLinkId) : undefined,
        linkId: Number(linkId),
        chatId: String(ctx.from?.id),
      },
    ).then(async config => {
      // await cronControllerAds.toggle(config);
    });
  }

  const watchLink = await getOneWatchLink({
    linkId: Number(linkId),
    chatId: String(ctx.from?.id),
  }).then(async watchLink => {
    watchLink ??= await createOneWatchLink({
      linkId: Number(linkId),
      chatId: String(ctx.from?.id),
    });
    return watchLink;
  });

  const active = watchLink.enable;

  const status = active ? "🔕" : "🔔";

  const menu = new InlineKeyboard();

  const newParams = new ParamsExtractorDB(menuButton.watchLink.toggle.data);
  newParams.addParams({
    linkId,
    watchLinkId: watchLink.id,
    toggle: active ? "false" : "true",
  });

  menu.text(
    `${status} ${active ? "Не отслеживать" : "Отслеживать"}`,
    await newParams.toStringAsync(),
  );

  await ctx.editAndReply.editMessageReplyMarkup({ reply_markup: menu });
};

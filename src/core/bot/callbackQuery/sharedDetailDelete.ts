import { deleteSharedLink, deleteShareKey } from "@core/db/models";

import { Context } from "../core/interface/Context";

export const sharedDetailDelete = async (ctx: Context) => {
  const params = ctx.paramsExtractor?.params ?? {};
  const linkId = params.linkId as string;

  await deleteShareKey({
    trackedLinkId: Number(linkId),
  });

  await deleteSharedLink({
    trackedLinkId: Number(linkId),
  });

  if (ctx.callbackQuery) {
    await ctx.answerCallbackQuery();
  }

  await ctx.reply("Ссылка успешно удалена из списка общих ссылок.");
};

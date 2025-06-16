import { deleteSharedLink } from "@core/db/models";

import { Context } from "../core/interface/Context";
import { categoriesSharedList } from "./categoriesSharedList";

export const detailSharedUnsubcribe = async (ctx: Context) => {
  const params = ctx.paramsExtractor?.params ?? {};
  const linkId = params.sharedLink as string;

  await deleteSharedLink({
    trackedLinkId: Number(linkId),
    chatId: String(ctx.chat?.id),
  });

  await categoriesSharedList(ctx);
};

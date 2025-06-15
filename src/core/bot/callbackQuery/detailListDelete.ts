import { cronManagerAds } from "@components/ads-check/ads-check.cron";
import { deleteOneTrackedLink } from "@core/db/models";

import { Context } from "../core/interface/Context";
import { categoriesList } from "./categoriesList";

export const detailListDelete = async (ctx: Context) => {
  const params = ctx.paramsExtractor?.params ?? {};
  const linkId = params.linkId as string;

  await deleteOneTrackedLink({
    id: Number(linkId),
    chatId: String(ctx.chat?.id),
  }).then(async config => {
    if (config) await cronManagerAds.removeJob(config.id);
  });

  await categoriesList(ctx);
};

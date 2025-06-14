import {
  createSharedLink,
  getOneSharedLink,
  getOneShareKey,
  getOneTrackedLink,
} from "@core/db/models";
import type { NextFunction } from "grammy";

import { Context } from "../core/interface/Context";

export const sharedUrl = async (
  ctx: Context,
  next: NextFunction,
  ref_value: string | null,
) => {
  if (!ref_value) {
    await ctx.reply("Ключ доступа не найден или недействителен.");
    return;
  }

  const shareKey = await getOneShareKey({ key: ref_value });

  if (!shareKey) {
    await ctx.reply("Ключ доступа не найден или недействителен.");
    return;
  }

  const shareLink = await getOneSharedLink({
    trackedLinkId: shareKey.trackedLinkId,
  });

  if (shareLink) {
    await ctx.reply(
      "Вы уже используете ссылку для получение общего доступа к контенту.",
    );
    return;
  }

  const trackedLinks = await getOneTrackedLink({ id: shareKey.trackedLinkId });

  if (trackedLinks?.chatId === String(ctx.chat?.id)) {
    await ctx.reply(
      "Данная ссылка уже используется вами. Вы не можете использовать ее повторно.",
    );
    return;
  }

  await createSharedLink({
    trackedLinkId: shareKey.trackedLinkId,
    chatId: String(ctx.chat?.id),
  });

  await ctx.reply("Вы успешно получили доступ к контенту по ссылке.");
};

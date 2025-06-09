import { getOneTypeByName } from "@core/db/models";
import { NextFunction } from "grammy";

import { Context } from "../interface/Context";
import { createMsg } from "../utils/createMsg";

export default async function typeCheck(ctx: Context, next: NextFunction) {
  const chatType = ctx.chat?.type;

  if (!chatType) {
    const msg = createMsg("error", "Не удалось определить тип чата");
    return ctx.reply(msg.text, { entities: msg.entities });
  }

  const config = await getOneTypeByName(chatType);

  if (!config) {
    const msg = createMsg("info", "Не удалось определить тип чата");
    return ctx.reply(msg.text, { entities: msg.entities });
  }

  if (!config.enable) {
    const msg = createMsg("info", "Бот отключен для этого типа чата");
    return ctx.reply(msg.text, { entities: msg.entities });
  }

  ctx.chatType = {
    id: config.id,
    name: config.name,
  };

  await next();
}

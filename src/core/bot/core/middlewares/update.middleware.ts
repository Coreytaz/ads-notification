import logger from "@core/utils/logger";
import { NextFunction } from "grammy";
import type { ChatMember } from "grammy/types";

import { Context } from "../interface/Context";

const mapStatus: Record<ChatMember["status"], (ctx: Context) => Promise<void>> =
  {
    creator: async () => {},
    administrator: async ctx => {},
    member: async ctx => {},
    restricted: async ctx => {},
    left: async ctx => {},
    kicked: async ctx => {},
  };

export default async function update(ctx: Context, next: NextFunction) {
  logger.debug(`isCallback = ${ctx.isCallback}`);

  //   await mapping(
  //     ctx.update?.my_chat_member?.new_chat_member?.status,
  //     mapStatus,
  //     () => {},
  //     ctx,
  //   );

  return next();
}

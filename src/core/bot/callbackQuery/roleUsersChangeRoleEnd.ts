import { updateOneChatTG } from "@core/db/models/chatTG.models.js";

import { Context } from "../core/interface/Context.js";
import { roleUsersUser } from "./roleUsersUser.js";

export const roleUsersChangeRoleEnd = async (ctx: Context) => {
  const params = ctx.paramsExtractor?.params as {
    chatId: string;
    roleId: string;
  };

  await updateOneChatTG(
    { roleId: Number(params.roleId) },
    { chatId: params.chatId },
  );

  await ctx.answerCallbackQuery();
  await roleUsersUser(ctx);
};

import { chatTG, findAndCountAllChatTG } from "@core/db/models";
import { eq, inArray, not } from "drizzle-orm";
import { InlineKeyboard } from "grammy";

import { Context } from "../core/interface/Context";
import { createPagination } from "../core/utils/pagination";
import { ParamsExtractorDB } from "../core/utils/paramsExractorDB";
import { menuButton } from "../menu/menuButton.config";

const ROLE_PERMISSIONS: Record<string, number[]> = {
  Admin: [],
  Moderator: [2, 3, 4],
  User: [2],
} as const;

const getWherefilterRole = (
  currentUserRoleName: keyof typeof ROLE_PERMISSIONS,
) => {
  const permissions = ROLE_PERMISSIONS[currentUserRoleName];

  if (!(permissions.length > 0)) return undefined;

  return inArray(chatTG.roleId, permissions);
};

export const systemRoleUsers = async (ctx: Context) => {
  const params = ctx.paramsExtractor?.params;
  const page = Number(params?.page) || 1;
  const limit = 5;

  const { data: chatsTG, total: count } = await findAndCountAllChatTG(
    {},
    {
      offset: (page - 1) * limit,
      limit,
    },
    getWherefilterRole(ctx.role.name),
    not(eq(chatTG.chatId, String(ctx.chat?.id))),
  );

  const menu = new InlineKeyboard();

  for (const chatTg of chatsTG) {
    const params = new ParamsExtractorDB(menuButton.roleUsers.user.data);
    params.addParam("chatId", chatTg.chatId);
    menu
      .text(
        "ID:" + String(chatTg.chatId) + " - (" + String(chatTg.name) + ")",
        await params.toStringAsync(),
      )
      .row();
  }

  await createPagination({
    count: Math.ceil(count / limit),
    page,
    menu,
    route: menuButton.system.settingsRoleUser.data,
    params,
  });

  menu
    .text(menuButton.roleUsers.back.label, menuButton.roleUsers.back.data)
    .row();

  await ctx.answerCallbackQuery();
  await ctx.editAndReply.reply(`Настройка роли пользователей`, {
    reply_markup: menu,
  });
};

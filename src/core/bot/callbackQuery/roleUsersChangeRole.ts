import { getAllRoles, role } from "@core/db/models";
import { inArray } from "drizzle-orm";
import { InlineKeyboard } from "grammy";

import { Context } from "../core/interface/Context";
import { ParamsExtractorDB } from "../core/utils/paramsExractorDB";
import { menuButton } from "../menu/menuButton.config";

const ROLE_PERMISSIONS: Record<string, number[]> = {
  Admin: [1, 2, 3, 4],
  Moderator: [2, 3, 4],
  User: [],
} as const;

const getWherefilterRole = (
  currentUserRoleName: keyof typeof ROLE_PERMISSIONS,
) => {
  const ids = ROLE_PERMISSIONS[currentUserRoleName];

  if (!(ids.length > 0)) return undefined;

  return inArray(role.id, ids);
};

export const roleUsersChangeRole = async (ctx: Context) => {
  const params = ctx.paramsExtractor?.params as {
    chatId: string;
  };

  const roles = await getAllRoles({}, getWherefilterRole(ctx.role.name));

  const menu = new InlineKeyboard();

  for (const role of roles) {
    const newParams = new ParamsExtractorDB(
      menuButton.roleUsers.changeRoleEnd.data,
    );
    newParams.addParam("chatId", params.chatId);
    newParams.addParam("roleId", role.id);
    menu.text(role.name, await newParams.toStringAsync()).row();
  }

  const newParams = new ParamsExtractorDB(menuButton.roleUsers.user.data);
  newParams.addParams(params);
  menu.text("Назад", await newParams.toStringAsync()).row();

  await ctx.answerCallbackQuery();
  await ctx.editAndReply.reply(`Выберите роль`, {
    reply_markup: menu,
  });
};

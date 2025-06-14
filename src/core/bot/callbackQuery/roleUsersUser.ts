import { getOneChatTG, getOneRole } from "@core/db/models";
import { InlineKeyboard } from "grammy";

import { Context } from "../core/interface/Context";
import { ParamsExtractorDB } from "../core/utils/paramsExractorDB";
import { separator } from "../core/utils/separator";
import { menuButton } from "../menu/menuButton.config";

export const roleUsersUser = async (ctx: Context) => {
  const params = ctx.paramsExtractor?.params as {
    chatId: string;
  };

  const chatTG = await getOneChatTG({
    chatId: params.chatId,
  });

  if (!chatTG) return;

  const role = await getOneRole({ id: chatTG.roleId });

  if (!role) return;

  const menu = new InlineKeyboard();

  const newParams = new ParamsExtractorDB(menuButton.roleUsers.changeRole.data);
  newParams.addParams(params);
  menu
    .text(
      menuButton.roleUsers.changeRole.label,
      await newParams.toStringAsync(),
    )
    .row();

  menu.text("Назад", menuButton.system.settingsRoleUser.data).row();

  await ctx.answerCallbackQuery();
  await ctx.editAndReply.reply(
    `Пользователей чата ${chatTG.name}\n${separator}\nРоль: ${role.name}\nID: ${chatTG.chatId}`,
    { reply_markup: menu },
  );
};

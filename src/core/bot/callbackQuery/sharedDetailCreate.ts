import {
  createOneShareKey,
  getOneShareKey,
  getTrackedLinkById,
} from "@core/db/models";
import { fmt, link as fmtLink } from "@grammyjs/parse-mode";
import { InlineKeyboard } from "grammy";

import { Context } from "../core/interface/Context";
import { separator } from "../core/utils/separator";
import { menuButton } from "../menu/menuButton.config";

const KEY_REF = "shared_url";

export const sharedDetailCreate = async (ctx: Context) => {
  const params = ctx.paramsExtractor?.params ?? {};
  const linkId = params.linkId as string;

  const menu = new InlineKeyboard();

  const link = await getTrackedLinkById(Number(linkId));

  if (!link) return;

  const shareKey = await getOneShareKey({ trackedLinkId: link.id }).then(
    async sharedKey => {
      sharedKey ??= await createOneShareKey({ trackedLinkId: link.id });
      return sharedKey;
    },
  );

  const token = shareKey.key;

  const url = `https://t.me/${ctx.me.username}?start=${KEY_REF}=${token}`;

  const { data, label } = menuButton.shared.back;

  menu.text(label, ctx.paramsExtractor?.toStringDB({ route: data })).row();

  if (ctx.callbackQuery) {
    await ctx.answerCallbackQuery();
  }

  const msg = fmt`Отправьте эту ссылку другому пользователю, и он получит доступ к данной категории.\n${separator}\n${fmtLink("Принять приглашение", url)}`;

  await ctx.editAndReply.reply(msg.text, {
    entities: msg.entities,
    reply_markup: menu,
  });
};

import { InlineKeyboard } from "grammy";

import { Context } from "../core/interface/Context.js";
import { ParamsExtractor } from "../core/utils/paramsExtractor.js";
import { menuButton } from "../menu/menuButton.config.js";

export const systemBrowser = async (ctx: Context) => {
  const { toggle } = ctx.paramsExtractor?.params as {
    toggle?: "false" | "true";
  };

  const active = true;

  const status = active ? "⏸" : "◀";

  const menu = new InlineKeyboard();

  const systemParam = new ParamsExtractor(menuButton.browser.toggle.data);
  systemParam.addParam("toggle", active);
  menu
    .text(
      `Браузер: ${status} (${active ? "Выключить" : "Включить"})`,
      systemParam.toString(),
    )
    .row();
  menu.text(menuButton.browser.back.label, menuButton.browser.back.data).row();

  await ctx.answerCallbackQuery();
  await ctx.editAndReply.reply(`Настройка headless browser`, {
    reply_markup: menu,
  });
};

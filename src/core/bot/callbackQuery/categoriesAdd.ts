import { createOneTrackedLinks } from "@core/db/models";
import { InlineKeyboard, type NextFunction } from "grammy";

import { Context } from "../core/interface/Context";
import commands from "../core/middlewares/commands.middleware";
import { isCommand } from "../core/utils/isCommand";
import { separator } from "../core/utils/separator";
import { menuButton } from "../menu/menuButton.config";
import { mainCategories } from "./mainCategories";

const avabledCategories = ["cian"];

const uppercase = (str: string) => str.toUpperCase();

const errrorMsg = (err: Error = new Error("Неверная ссылка на сервис.")) =>
  `${err.message}. Пожалуйста, введите ссылку на доступный сервис\n${separator}\nСписок доступных сервисов\n${separator}\n${avabledCategories.map(uppercase).join(", ")}`;

export const categoriesAdd = async (ctx: Context, next: NextFunction) => {
  const { data, label } = menuButton.categoriesAdd.back;

  if (ctx.callbackQuery?.data === data) {
    await ctx.step.toggleStep(false);
    return mainCategories(ctx);
  }

  const msg = ctx.message?.text;

  const menu = new InlineKeyboard();

  menu.text(label, data);

  if (msg) {
    if (isCommand(msg)) {
      await ctx.step.toggleStep(false);
      await commands(ctx, next);
      return;
    }

    try {
      let parsedUrl = new URL(msg);
      const domain = parsedUrl.hostname.split(".").at(-2);

      if (!(domain && avabledCategories.includes(domain))) {
        await ctx.editAndReply.reply(errrorMsg(), {
          reply_markup: menu,
        });
        return;
      }
    } catch (error) {
      if (error instanceof Error) {
        await ctx.editAndReply.reply(errrorMsg(error), {
          reply_markup: menu,
        });
        return;
      }
    }

    await createOneTrackedLinks({
      url: msg,
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain, @typescript-eslint/no-non-null-assertion
      chatId: String(ctx.chat?.id!),
      cronTime: "*/10 * * * *",
      enable: 1,
    });
    await ctx.step.toggleStep(false);
    return mainCategories(ctx);
  }

  await ctx.step.saveStep(true, { step: menuButton.categories.add.data });

  if (ctx.callbackQuery) {
    await ctx.answerCallbackQuery();
  }

  await ctx.editAndReply.reply(
    "Вставьте ссылку на КАТЕГОРИЮ, не на продавца, не на объявление, а на категорию, в которой бот будет искать объявления для вас.",
    {
      reply_markup: menu,
    },
  );
};

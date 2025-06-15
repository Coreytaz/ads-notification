import { cronControllerAds } from "@components/ads-check/ads-check.cron";
import { updateOneTrackedLink } from "@core/db/models";
import { InlineKeyboard, type NextFunction } from "grammy";

import { Context } from "../core/interface/Context";
import commands from "../core/middlewares/commands.middleware";
import { isCommand } from "../core/utils/isCommand";
import { separator } from "../core/utils/separator";
import { menuButton } from "../menu/menuButton.config";
import { detailListDetail } from "./detailListDetail";

const avabledCategories = ["cian"];

const exampleCategory: Record<string, string> = {
  cian: "https://www.cian.ru/cat.php?deal_type=sale&region=1",
};

const exampleCategoryMsg = (category: string) => {
  return `${uppercase(category)} ${exampleCategory[category] ? "- Пример (" + exampleCategory[category] + ")" : ""}`;
};

const uppercase = (str: string) => str.toUpperCase();

const errrorMsg = (err: Error = new Error("Неверная ссылка на сервис.")) =>
  `${err.message}. Пожалуйста, введите ссылку на доступный сервис.\n${separator}\nСписок доступных сервисов\n${separator}\n${avabledCategories.map(exampleCategoryMsg).join("\n")}`;

export const detailListEditUrl = async (ctx: Context, next: NextFunction) => {
  const params = ctx.paramsExtractor?.params ?? {};
  const linkId = params.linkId as string;

  const { data, label } = menuButton.editUrl.back;

  if (ctx.callbackQuery?.data === data) {
    await ctx.step.toggleStep(false);
    return detailListDetail(ctx);
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

    await updateOneTrackedLink(
      {
        url: msg,
      },
      {
        id: Number(linkId),
      },
    ).then(config => {
      cronControllerAds.changeConfig(config);
    });

    await ctx.step.toggleStep(false);
    return detailListDetail(ctx);
  }

  await ctx.step.saveStep(true, {
    step: ctx.paramsExtractor?.toStringDB({
      route: menuButton.detailList.editUrl.data,
    }),
  });

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

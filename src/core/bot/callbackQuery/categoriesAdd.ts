import { cronControllerAds } from "@components/ads-check/ads-check.cron";
import { createOneTrackedLinks } from "@core/db/models";
import { mapping } from "@core/utils/mapping";
import { InlineKeyboard, type NextFunction } from "grammy";

import { Context } from "../core/interface/Context";
import commands from "../core/middlewares/commands.middleware";
import { isCommand } from "../core/utils/isCommand";
import { loggerTG } from "../core/utils/logger";
import { ParamsExtractorDB } from "../core/utils/paramsExractorDB";
import { separator } from "../core/utils/separator";
import { menuButton } from "../menu/menuButton.config";
import { mainCategories } from "./mainCategories";

type Step = "title" | "category";

interface Params {
  step?: Step;
}

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

const mapStep: Record<
  Step,
  (ctx: Context, next: NextFunction, menu: InlineKeyboard) => Promise<void>
> = {
  title: async (ctx, next, menu) => {
    const newParams = new ParamsExtractorDB(
      ctx.paramsExtractor?.toString() ?? "",
    );

    const msg = ctx.message?.text;

    let replyMsg = "Введите заголовок для категории";

    if (msg) {
      if (msg.length < 3) {
        await ctx.reply("Заголовок должен быть больше 3 символов");
        return;
      }
      newParams.addParam("step", "category");
      newParams.addParam("title", msg);
      replyMsg = `Вставьте ссылку на КАТЕГОРИЮ, не на продавца, не на объявление, а на категорию, в которой бот будет искать объявления для вас.`;
    }

    await ctx.step.saveStep(true, { step: await newParams.toStringAsync() });
    await ctx.editAndReply.reply(replyMsg, {
      reply_markup: menu,
    });
  },
  category: async (ctx, next, menu) => {
    const newParams = new ParamsExtractorDB(
      ctx.paramsExtractor?.toString() ?? "",
    );
    const msg = ctx.message?.text;

    if (msg) {
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

      const newTrackedLink = await createOneTrackedLinks({
        url: msg,
        title: newParams.params?.title ?? msg ?? "Без названия",
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain, @typescript-eslint/no-non-null-assertion
        chatId: String(ctx.chat?.id!),
        cronTime: "*/10 * * * *",
        enable: 1,
      }).catch(async (error: unknown) => {
        if (error instanceof Error)
          await loggerTG.error(
            `Ошибка при создании категории: ${error.message}`,
          );
        return null;
      });

      await ctx.step.toggleStep(false);

      if (!newTrackedLink) {
        await ctx.editAndReply.reply("Ошибка при создании категории", {
          reply_markup: menu,
        });
        return;
      }

      cronControllerAds.addJob(newTrackedLink);

      await ctx.editAndReply.reply(
        `Категория успешно создана\n${separator}\nЗаголовок: ${newTrackedLink.title}\nСсылка на категорию: ${newTrackedLink.url}`,
        {
          reply_markup: menu,
        },
      );
      return;
    }

    await ctx.step.saveStep(true, { step: await newParams.toStringAsync() });

    await ctx.editAndReply.reply(errrorMsg(Error("Неверный формат данных.")), {
      reply_markup: menu,
    });
  },
};

export const categoriesAdd = async (ctx: Context, next: NextFunction) => {
  const params = ctx.paramsExtractor?.params as Params;

  const { data, label } = menuButton.categoriesAdd.back;

  if (isCommand(ctx.message?.text)) {
    await ctx.step.toggleStep(false);
    await commands(ctx, next);
    return;
  }

  if (ctx.callbackQuery?.data === data) {
    await ctx.step.toggleStep(false);
    return mainCategories(ctx);
  }

  const menu = new InlineKeyboard();

  menu.text(label, data);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/no-non-null-asserted-optional-chain, @typescript-eslint/no-non-null-assertion
  await mapping(params?.step!, mapStep, mapStep.title, ctx, next, menu);
};

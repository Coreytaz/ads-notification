import { cronControllerAds } from "@components/ads-check/ads-check.cron";
import { updateOneTrackedLink } from "@core/db/models";
import { InlineKeyboard, type NextFunction } from "grammy";

import { Context } from "../core/interface/Context";
import commands from "../core/middlewares/commands.middleware";
import { isCommand } from "../core/utils/isCommand";
import { separator } from "../core/utils/separator";
import { menuButton } from "../menu/menuButton.config";
import { detailListDetail } from "./detailListDetail";

const mapCron = {
  "каждую 1 минуту": "*/1 * * * *",
  "каждые 5 минут": "*/5 * * * *",
  "каждые 10 минут": "*/10 * * * *",
  "каждые 30 минут": "*/30 * * * *",
};

const avabledCron = [
  "каждую 1 минуту",
  "каждые 5 минут",
  "каждые 10 минут",
  "каждые 30 минут",
];

const exampleCronMsg = (cron: string, index: number) => {
  return `${index + 1}. \`${cron}\``;
};

const errrorMsg = (err: Error = new Error("Неверная ссылка на сервис.")) =>
  `${err.message}. Пожалуйста, введите доступное значения.\n${separator}\nСписок доступных значений\n${separator}\n${avabledCron.map(exampleCronMsg).join("\n")}`;

export const detailListEditCron = async (ctx: Context, next: NextFunction) => {
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

    if (!avabledCron.includes(msg)) {
      await ctx.editAndReply.reply(errrorMsg(Error("Не правильный формат")), {
        reply_markup: menu,
        parse_mode: "Markdown",
      });
      return;
    }

    const value = mapCron[msg as keyof typeof mapCron];

    if (!value) {
      await ctx.editAndReply.reply(errrorMsg(Error("Не правильный формат")), {
        reply_markup: menu,
        parse_mode: "Markdown",
      });
      return;
    }

    await updateOneTrackedLink(
      {
        cronTime: value,
      },
      {
        id: Number(linkId),
      },
    ).then(config => {
      cronControllerAds.changeCron(config.id, value);
    });

    await ctx.step.toggleStep(false);
    return detailListDetail(ctx);
  }

  await ctx.step.saveStep(true, {
    step: ctx.paramsExtractor?.toStringDB({
      route: menuButton.detailList.editCron.data,
    }),
  });

  if (ctx.callbackQuery) {
    await ctx.answerCallbackQuery();
  }

  await ctx.editAndReply.reply(
    `Список доступных значений\n${separator}\n${avabledCron.map(exampleCronMsg).join("\n")}`,
    {
      reply_markup: menu,
      parse_mode: "Markdown",
    },
  );
};

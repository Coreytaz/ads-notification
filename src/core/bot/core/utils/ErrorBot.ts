/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */

import logger from "@core/utils/logger";

import { Context } from "../interface/Context";
import { loggerTG } from "./logger";
import { parseObjectToHTML } from "./parseObjectToHTML";
import { separator } from "./separator";

export default class ErrorBot extends Error {
  public readonly ctx: Context;
  public readonly systemError: boolean;

  constructor(description: string, ctx: Context, systemError = false) {
    super(description);
    this.ctx = ctx;
    this.systemError = systemError;

    if (systemError) {
      try {
        const error = parseObjectToHTML({
          users: { title: "Пользователь", value: `@${ctx.from?.username}` },
          chatId: {
            title: "ЧатID",
            value: String(ctx.chatId),
            options: { spoiler: true },
          },
          chatName: { title: "Название чата", value: ctx.chat?.title! },
          role: {
            title: "Роль",
            value: ctx.role.name,
            separator: () => `\n${separator}\n`,
          },
          description: {
            title: "Описание",
            value: description,
            separator: () => `\n${separator}\n`,
          },
          msg: ctx.message?.text
            ? {
                title: "Сообщение",
                value: ctx.message.text,
                separator: () => `\n${separator}\n`,
              }
            : undefined,
          btn: ctx.callbackQuery?.data
            ? {
                title: "Кнопка",
                value: ctx.callbackQuery.data,
                options: { pre: true },
                separator: () => `\n${separator}\n`,
              }
            : undefined,
          // stepActive: { title: "Шаг активный", value: ctx.step.context().enable ?? false },
          // step: ctx.step?.context()?.step && { title: "Шаг", value: ctx.step.context().step, options: { pre: true } },
        });
        void loggerTG.error(error);
      } catch (error) {
        logger.error(error);
      }
    }

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

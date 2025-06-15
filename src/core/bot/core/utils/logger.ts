import config from "@config/config";
import { chatTG, getAllChatTg } from "@core/db/models";
import logger from "@core/utils/logger";
import { FormattedString } from "@grammyjs/parse-mode";
import { eq } from "drizzle-orm";

import bot from "../core";
import { TypeLogger } from "../interface/Logger";
import { Other } from "../interface/types";
import { createMsg } from "./createMsg";

class LoggerTG {
  private async message(
    type: TypeLogger,
    message: string | FormattedString,
    _other?: Other<"sendMessage", "chat_id" | "text">,
  ) {
    const chats = await getAllChatTg({}, eq(chatTG.roleId, 1));

    const fmtMessage = createMsg(type, message);

    for (const chat of chats) {
      try {
        await bot.api.sendMessage(chat.chatId, fmtMessage.text, {
          entities: fmtMessage.entities,
          ..._other,
        });
      } catch (error) {
        logger.error(error);
      }
    }
  }

  public async debug(
    message: string | FormattedString,
    other?: Other<"sendMessage", "chat_id" | "text">,
  ) {
    if (config.isDev) {
      await this.message("debug", message, other);
    }
  }

  public async info(
    message: string | FormattedString,
    other?: Other<"sendMessage", "chat_id" | "text">,
  ) {
    await this.message("info", message, other);
  }

  public async error(
    message: string | FormattedString,
    other?: Other<"sendMessage", "chat_id" | "text">,
  ) {
    await this.message("error", message, other);
  }
}

export const loggerTG = new LoggerTG();

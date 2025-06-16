import {
  createOneChatReply,
  findOneChatReply,
  updateOneChatReply,
} from "@core/db/models";
import { isEmpty } from "@core/utils/isEmpty";
import type { NextFunction } from "grammy";
import type { Message } from "grammy/types";

import type { Context } from "../interface/Context";
import { ContextWithEditAndReply } from "../interface/ContextWithEditAndReply";
import { getMessageId } from "../utils/getMessageId";

export interface EditAndReply {
  reply: (text: string, options?: unknown) => Promise<void>;
}

const find = async (ctx: Context) => {
  const replyMsg = await findOneChatReply({
    chatId: String(ctx.chat?.id),
    messageId: getMessageId(ctx),
  });
  return replyMsg;
};

const create = async (ctx: Context, messageId: number) => {
  let reply = await findOneChatReply({
    chatId: String(ctx.chat?.id),
    messageId,
  });

  if (!isEmpty(reply)) {
    reply = await updateOneChatReply(
      {
        chatId: String(ctx.chat?.id),
        messageId: messageId,
      },
      {
        messageId: messageId,
      },
    );
    return reply;
  }

  reply = await createOneChatReply({
    chatId: String(ctx.chat?.id),
    messageId: messageId,
  });

  return reply;
};

const editAndReplyContext = (
  ctx: Context,
): ContextWithEditAndReply["editAndReply"] => {
  return {
    reply: async (text, options) => {
      const replyMsg = await find(ctx);

      if (isEmpty(replyMsg)) {
        const message = await ctx.reply(text, options);
        await create(ctx, message.message_id);
        return message;
      }

      const editedMessage = await ctx.api.editMessageText(
        Number(ctx.chat?.id),
        Number(replyMsg?.messageId),
        text,
        options as Parameters<typeof ctx.api.editMessageText>[3],
      );
      return editedMessage as Message.TextMessage;
    },
    editMessageReplyMarkup: async options => {
      const replyMsg = await find(ctx);

      if (isEmpty(replyMsg)) {
        const message = await ctx.reply("", options);
        await create(ctx, message.message_id);
        return { ...message, edit_date: message.date };
      }

      const editedMessage = await ctx.api.editMessageReplyMarkup(
        Number(ctx.chat?.id),
        Number(replyMsg?.messageId),
        options,
      );
      return editedMessage;
    },
    sendMessage: async (text, options) => {
      const replyMsg = await find(ctx);

      if (isEmpty(replyMsg)) {
        const message = await ctx.api.sendMessage(
          Number(ctx.chat?.id),
          text,
          options,
        );
        await create(ctx, message.message_id);
        return message;
      }

      const sentMessage = await ctx.api.sendMessage(
        Number(ctx.chat?.id),
        text,
        options,
      );
      return sentMessage;
    },
  };
};

export default async function editAndReply(ctx: Context, next: NextFunction) {
  ctx.editAndReply = editAndReplyContext(ctx);
  await next();
}

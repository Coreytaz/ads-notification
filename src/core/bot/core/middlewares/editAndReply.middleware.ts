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
  let messageId = getMessageId(ctx);
  return {
    messageId,
    reply: async (text, options) => {
      const replyMsg = await find(ctx);

      if (isEmpty(replyMsg)) {
        const message = await ctx.reply(text, options);
        const replyRecord = await create(ctx, message.message_id);
        messageId = replyRecord.messageId;
        return message;
      }

      const _messageId = replyMsg?.messageId;
      if (replyMsg) {
        messageId = _messageId;
      }

      const editedMessage = await ctx.api.editMessageText(
        Number(ctx.chat?.id),
        Number(_messageId),
        text,
        options as Parameters<typeof ctx.api.editMessageText>[3],
      );
      return editedMessage as Message.TextMessage;
    },
  };
};

export default async function editAndReply(ctx: Context, next: NextFunction) {
  ctx.editAndReply = editAndReplyContext(ctx);
  await next();
}

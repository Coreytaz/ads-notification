import {
  createOneChatReply,
  findOneChatReply,
  updateOneChatReply,
} from "@core/db/models";
import { isEmpty } from "@core/utils/isEmpty";
import type { NextFunction } from "grammy";

import type { Context } from "../interface/Context";
import { ContextWithEditAndReply } from "../interface/ContextWithEditAndReply";

export interface EditAndReply {
  reply: (text: string, options?: unknown) => Promise<void>;
}

const find = async (ctx: Context) => {
  const replyMsg = await findOneChatReply({
    chatId: String(ctx.chat?.id),
    messageId:
      ctx.editedMessage?.message_id ??
      ctx.message?.message_id ??
      ctx.callbackQuery?.message?.message_id,
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
  let messageId;
  return {
    messageId,
    reply: async (text, options): Promise<void> => {
      const replyMsg = await find(ctx);

      if (isEmpty(replyMsg)) {
        const message = await ctx.reply(text, options);
        const reply = await create(ctx, message.message_id);
        messageId = reply.messageId;
        return;
      }

      const _messageId = replyMsg?.messageId;
      if (replyMsg) {
        messageId = _messageId;
      }

      await ctx.api.editMessageText(
        Number(ctx.chat?.id),
        Number(_messageId),
        text,
        options,
      );
    },
  };
};

export default async function editAndReply(ctx: Context, next: NextFunction) {
  ctx.editAndReply = editAndReplyContext(ctx);
  await next();
}

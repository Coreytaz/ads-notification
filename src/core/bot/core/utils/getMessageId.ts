import type { Context } from "../interface/Context";

export const getMessageId = (ctx: Context) => {
  return (
    ctx.editedMessage?.message_id ??
    ctx.message?.message_id ??
    ctx.callbackQuery?.message?.message_id
  );
};

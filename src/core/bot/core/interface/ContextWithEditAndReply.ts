import type { Context } from "./Context";

export interface ContextWithEditAndReply {
  editAndReply: {
    messageId: number | undefined;
    reply: Context["reply"];
  };
}

import type { Context } from "./Context";

export interface ContextWithEditAndReply {
  editAndReply: {
    reply: Context["reply"];
  };
}

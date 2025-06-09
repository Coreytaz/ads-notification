import type { RawApi } from "grammy";

import type { Other } from "./types";

export interface ContextWithEditAndReply {
  editAndReply: {
    messageId: number | undefined;
    reply: (
      text: string,
      options?: Other<RawApi, "sendMessage", "chat_id" | "text">,
    ) => Promise<void>;
  };
}

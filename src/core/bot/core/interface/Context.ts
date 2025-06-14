import type {
  chatTG,
  ChatType,
  permissions,
  role,
  rules,
} from "@core/db/models";
import type { CommandsFlavor } from "@grammyjs/commands";
import type { Context as BaseContext } from "grammy";

import type { ParamsExtractorDB } from "../utils/paramsExractorDB";
import type { ContextWithEditAndReply } from "./ContextWithEditAndReply";
import type { ContextWithStep } from "./ContextWithStep";

export interface Context
  extends BaseContext,
    CommandsFlavor,
    ContextWithEditAndReply,
    ContextWithStep {
  chatDB: typeof chatTG.$inferSelect;
  role: typeof role.$inferSelect;
  configUser: typeof permissions.$inferSelect;
  rules: Record<string, typeof rules.$inferSelect>;
  chatType: { id: number; name: ChatType };

  paramsExtractor?: ParamsExtractorDB;

  usernameBot?: string;
  referralLink?: string;

  isMsg?: boolean;
  isCmd?: boolean;
  isCallback?: boolean;
  isKeyboard?: boolean;
}

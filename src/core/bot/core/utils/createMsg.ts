import { bold, fmt, FormattedString } from "@grammyjs/parse-mode";

import type { TypeLogger } from "../interface/Logger";
import { semiSeparator } from "./semiSeparator";

export const createMsg = (
  type: TypeLogger,
  message: string | FormattedString,
) => {
  return fmt`${semiSeparator} ${bold(type.toUpperCase())} ${semiSeparator}\n${message}`;
};

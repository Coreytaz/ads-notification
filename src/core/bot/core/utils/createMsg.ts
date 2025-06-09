import { b, fmt, FormattedString } from "@grammyjs/parse-mode";

import { TypeLogger } from "../interface/Logger";
import { semiSeparator } from "./SemiSeparator";

export const createMsg = (
  type: TypeLogger,
  message: string | FormattedString,
) => {
  return fmt`${semiSeparator} ${b}${type.toUpperCase()}${b} ${semiSeparator}\n${message}`;
};

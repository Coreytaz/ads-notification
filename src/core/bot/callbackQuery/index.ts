import type { NextFunction } from "grammy";

import { Context } from "../core/interface/Context";

export default {} as Record<
  string,
  (ctx: Context, next: NextFunction) => Promise<void>
>;

import { NextFunction } from "grammy";

import { Context } from "../interface/Context";
import { IdentifyKeys } from "../interface/Identify";
import { isCommand } from "../utils/isCommand";
import { loggerTG } from "../utils/logger";

const keys: IdentifyKeys[] = ["isCallback", "isCmd", "isMsg", "isKeyboard"];

const toggleContext = (
  ctx: Context,
  toggler: Partial<Record<keyof Pick<Context, IdentifyKeys>, boolean>>,
) => {
  keys.forEach(key => {
    ctx[key] = toggler[key] ?? false;
  });
};

export default async function identify(ctx: Context, next: NextFunction) {
  try {
    if (ctx.callbackQuery?.message) {
      toggleContext(ctx, { isKeyboard: true });
      await next();
      return;
    }
    if (isCommand(ctx.message?.text)) {
      toggleContext(ctx, { isCmd: true });
      await next();
      return;
    }
    if (ctx.message) {
      toggleContext(ctx, { isMsg: true });
      await next();
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (ctx.update) {
      toggleContext(ctx, { isCallback: true });
      await next();
      return;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    void loggerTG.error(`Error in Identify middleware: ${errorMessage}`);
  }
}

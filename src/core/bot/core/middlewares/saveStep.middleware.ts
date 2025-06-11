import { drizzle } from "@core/db";
import { chatStep } from "@core/db/models/chatStep.models";
import { eq } from "drizzle-orm";
import { NextFunction } from "grammy";

import { Context } from "../interface/Context";
import { ContextWithStep } from "../interface/ContextWithStep";
import { IdentifyKeys } from "../interface/Identify";

const getKeyType = (ctx: Context): IdentifyKeys => {
  const { isKeyboard, isCmd, isMsg, isCallback } = ctx;

  return (Object.entries({ isKeyboard, isCmd, isMsg, isCallback }).find(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ([_, value]) => value === true,
  )?.[0] ?? "isMsg") as IdentifyKeys;
};

const saveStep = async (
  ctx: Context,
  _args?: [boolean, (typeof chatStep.$inferInsert)["context"]],
) => {
  const [enable = false, context] = _args ?? [];

  const stepData: typeof chatStep.$inferInsert = {
    enable: enable ? 1 : 0,
    context: {
      step:
        ctx.callbackQuery?.data ??
        ctx.message?.text ??
        ctx.callbackQuery?.message?.text ??
        "",
      type: getKeyType(ctx),
      ...context,
    },
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    messageId: ctx.editAndReply.messageId!,
  };

  const existingStep = await drizzle
    .select()
    .from(chatStep)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .where(eq(chatStep.messageId, ctx.editAndReply.messageId!))
    .get();

  if (existingStep) {
    await drizzle
      .update(chatStep)
      .set(stepData)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .where(eq(chatStep.messageId, ctx.editAndReply.messageId!))
      .run();
    return { ...existingStep, ...stepData };
  } else {
    const result = await drizzle
      .insert(chatStep)
      .values(stepData)
      .returning()
      .get();
    return result;
  }
};

const findStep = async (ctx: Context) => {
  console.log(ctx.editAndReply);
  return await drizzle
    .select()
    .from(chatStep)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .where(eq(chatStep.messageId, ctx.editAndReply.messageId!))
    .get();
};

const deleteStep = async (ctx: Context) => {
  await drizzle
    .delete(chatStep)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .where(eq(chatStep.messageId, ctx.editAndReply.messageId!))
    .run();
};

const checkStep = (step: typeof chatStep.$inferSelect | null) => {
  return !!step;
};

const saveStepContext = (ctx: Context): ContextWithStep["step"] => {
  let _step: typeof chatStep.$inferSelect | null = null;

  return {
    context: () => {
      return _step ? { ..._step.context, enable: _step.enable === 1 } : null;
    },
    saveStep: async (...args) => {
      const step = await saveStep(ctx, args);
      _step = step;
    },
    findStep: async () => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (checkStep(_step)) return _step.context ?? null;
      const step = await findStep(ctx);
      _step = step ?? null;
      return step?.context ?? null;
    },
    deleteStep: async () => {
      await deleteStep(ctx);
      _step = null;
    },
    toggleStep: async enable => {
      if (checkStep(_step)) {
        _step.enable = enable ? 1 : 0;
        await drizzle
          .update(chatStep)
          .set({ enable: _step.enable })
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          .where(eq(chatStep.messageId, ctx.editAndReply.messageId!))
          .run();
      } else {
        const step = await findStep(ctx);
        _step = step ?? null;
        if (step) {
          await drizzle
            .update(chatStep)
            .set({ enable: enable ? 1 : 0 })
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            .where(eq(chatStep.messageId, ctx.editAndReply.messageId!))
            .run();
        }
      }
    },
    isActive: async () => {
      if (checkStep(_step)) return _step.enable === 1;
      const step = await findStep(ctx);
      _step = step ?? null;
      console.log("step", step?.enable === 1);
      return step?.enable === 1;
    },
  };
};

export default async function steps(ctx: Context, next: NextFunction) {
  ctx.step = saveStepContext(ctx);
  await next();
}

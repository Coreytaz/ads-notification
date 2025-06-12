import { drizzle } from "@core/db";
import {
  chatTG,
  permissionRules,
  permissions,
  role as _role,
  rules,
} from "@core/db/models";
import { isEmpty } from "@core/utils/isEmpty";
import logger from "@core/utils/logger";
import { and, desc, eq, isNull, or } from "drizzle-orm";
import { NextFunction } from "grammy";

import { Context } from "../interface/Context";
import ErrorBot from "../utils/ErrorBot";
import { reduceRules } from "../utils/reduceRules";

export default async function userCheck(ctx: Context, next: NextFunction) {
  try {
    if (!ctx.chatId)
      throw new ErrorBot("Не удалось определить чат!", ctx, true);

    const chat = await drizzle.transaction(async tx => {
      const existingChat = await tx
        .select({ chat: chatTG, role: _role })
        .from(chatTG)
        .where(eq(chatTG.chatId, String(ctx.chatId)))
        .leftJoin(_role, eq(_role.id, chatTG.roleId))
        .get();

      if (isEmpty(existingChat)) {
        const chatTg: typeof chatTG.$inferInsert = {
          chatId: String(ctx.chatId),
          name:
            ctx.chat?.title ?? ctx.chat?.username ?? ctx.chat?.first_name ?? "",
          roleId: 2,
        };

        const newChat = await tx
          .insert(chatTG)
          .values(chatTg)
          .returning()
          .get();

        const newRole = await tx
          .select()
          .from(_role)
          .where(eq(_role.id, 2))
          .get();

        return {
          chat: newChat,
          role: newRole,
        };
      }

      return existingChat;
    });

    if (!chat?.chat || !chat.role)
      throw new Error("Chat not found in database!");

    ctx.chatDB = chat.chat;
    ctx.role = chat.role;
    const roleId = chat.role.id;

    const permission = await drizzle.transaction(async tx => {
      const permissionResult = await tx
        .select({
          permission: permissions,
          rules: rules,
        })
        .from(permissions)
        .where(
          or(
            and(
              eq(permissions.roleId, roleId),
              eq(permissions.chatId, chat.chat.chatId),
              eq(permissions.chatType, ctx.chatType.id),
            ),
            and(
              eq(permissions.roleId, roleId),
              isNull(permissions.chatId),
              eq(permissions.chatType, ctx.chatType.id),
            ),
          ),
        )
        .leftJoin(
          permissionRules,
          eq(permissionRules.permissionId, permissions.id),
        )
        .leftJoin(rules, eq(rules.id, permissionRules.ruleId))
        .orderBy(desc(permissions.chatId))
        .all();

      if (isEmpty(permissionResult)) {
        return null;
      }

      const grouped = permissionResult.reduce(
        (acc, row) => {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (!acc.permission) {
            acc.permission = row.permission;
            acc.rules = [];
          }
          if (row.rules) {
            acc.rules.push(row.rules);
          }
          return acc;
        },
        {} as {
          permission: typeof permissions.$inferSelect;
          rules: (typeof rules.$inferSelect)[];
        },
      );

      return grouped;
    });

    if (!permission) {
      throw new ErrorBot("Нет прав доступа!", ctx, true);
    }

    ctx.configUser = permission.permission;
    ctx.rules = reduceRules(permission.rules);

    if (!permission.permission.enable) {
      throw new ErrorBot("Нет прав доступа!", ctx, true);
    }

    await next();
    return;
  } catch (error) {
    if (error instanceof ErrorBot) {
      logger.error(error.message);
    }
  }
}

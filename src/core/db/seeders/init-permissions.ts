import logger from "@core/utils/logger";

import { drizzle } from "../drizzle";
import {
  getAllPermissionRules,
  getAllPermissions,
  getAllRoles,
  getAllRules,
  getAllTypeTG,
  permissionRules,
  permissions,
} from "../models";

const idCommand = {
  "/id": {
    enable: true,
  },
};

const resetCommand = {
  "/reset": {
    enable: true,
  },
};

const startCommand = {
  "/start": {
    enable: true,
  },
};

const guestRules = Object.assign({}, idCommand, resetCommand, startCommand);

const userRules = Object.assign({}, guestRules, {
  "/menu": {
    enable: true,
  },
  "main/categories": {
    enable: true,
  },
  "categories/back": {
    enable: true,
  },
  "categories/add": {
    enable: true,
  },
  "categories/add/back": {
    enable: true,
  },
  "categories/list": {
    enable: true,
  },
  "categoriesList/back": {
    enable: true,
  },
  "categories/sharedList": {
    enable: true,
  },
  "detailList/detail": {
    enable: true,
  },
  "detailList/back": {
    enable: true,
  },
  "detailList/editUrl": {
    enable: true,
  },
  "editUrl/back": {
    enable: true,
  },
  "detailList/editCron": {
    enable: true,
  },
  "detailList/shared": {
    enable: true,
  },
  "detailList/delete": {
    enable: true,
  },
  "detailList/toggle": {
    enable: true,
  },
  "detailList/editTitle": {
    enable: true,
  },
  "sharedDetail/create": {
    enable: true,
  },
  "sharedDetail/delete": {
    enable: true,
  },
  "sharedDetail/back": {
    enable: true,
  },
  "shared/back": {
    enable: true,
  },
  "detailShared/detail": {
    enable: true,
  },
  "detailShared/unsubcribe": {
    enable: true,
  },
  "detailShared/back": {
    enable: true,
  },
  "categoriesSharedList/back": {
    enable: true,
  },
  "watchLink/toggle": {
    enable: true,
  },
});

const moderatorPrivateRules = Object.assign({}, userRules, {
  "main/system": {
    enable: true,
  },
  "system/back": {
    enable: true,
  },
  "system/roleUsers": {
    enable: true,
  },
  "roleUsers/user": {
    enable: true,
  },
  "roleUsers/back": {
    enable: true,
  },
  "roleUsers/changeRole": {
    enable: true,
  },
  "roleUsers/changeRoleEnd": {
    enable: true,
  },
});

const initPermissionConfig = {
  private: {
    enable: true,
    role: {
      Admin: {
        enable: true,
        commands: "*",
      },
      Moderator: {
        enable: true,
        commands: Object.assign({}, moderatorPrivateRules),
      },
      User: {
        enable: true,
        commands: Object.assign({}, userRules),
      },
      Guest: {
        enable: true,
        commands: Object.assign({}, guestRules),
      },
    },
  },
};

const genKey = (...args: string[]) => args.join("_");

const generatePermissions = (
  config: Record<string, unknown> | ArrayLike<unknown>,
  roles: Record<string, any>,
  rules: Record<string, any>,
  type: Record<string, any>,
) => {
  const permission_rules: { permissionId: number; ruleId: any }[] = [];
  const permissions: Record<
    string,
    { id: number; chatType: number; roleId: any; chatId: any; enable: number }
  > = {};
  let count = 1;
  Object.entries(config).forEach(([chatType, value]) => {
    const current = value as { enable: boolean; role: Record<string, any> };
    if (current.enable) {
      Object.entries(current.role).forEach(([role, roleValue]) => {
        if (roleValue.enable) {
          const key = genKey(chatType, role);
          permissions[key] ??= {
            id: count,
            chatType: type[chatType],
            roleId: roles[role],
            chatId: null,
            enable: 1,
          };
          if (roleValue.commands === "*") {
            const ruleId = rules[roleValue.commands];
            if (ruleId) {
              permission_rules.push({
                permissionId: count,
                ruleId,
              });
            }
          } else {
            Object.entries(roleValue.commands).forEach(
              ([command, commandValue]) => {
                if ((commandValue as { enable: boolean }).enable) {
                  const ruleId = rules[command];
                  if (ruleId) {
                    permission_rules.push({
                      permissionId: count,
                      ruleId,
                    });
                  }
                }
              },
            );
          }
          count += 1;
        }
      });
    }
  });

  return { permissions: Object.values(permissions), permission_rules };
};

export default async function seedDefaultConfig() {
  try {
    const existingPermissions = await getAllPermissions({});
    const existingPermissionRules = await getAllPermissionRules({});

    if (existingPermissions.length > 0 || existingPermissionRules.length > 0) {
      logger.info(
        "existingPermissions | existingPermissionRules already exists, skipping seeding.",
      );
      return;
    }

    const roles = (await getAllRoles({})).reduce<Record<string, number>>(
      (acc, role) => {
        acc[role.name] = role.id;
        return acc;
      },
      {},
    );

    const type = (await getAllTypeTG({})).reduce<Record<string, number>>(
      (acc, role) => {
        acc[role.name] = role.id;
        return acc;
      },
      {},
    );

    const rules = (await getAllRules({})).reduce<Record<string, number>>(
      (acc, rule) => {
        if (rule.route !== null) {
          acc[rule.route] = rule.id;
        }
        return acc;
      },
      {},
    );

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!roles || !rules) {
      logger.info(`Roles or rules not found, skipping seeder.`);
      return;
    }

    const { permissions: permissionsData, permission_rules } =
      generatePermissions(initPermissionConfig, roles, rules, type);

    await drizzle.insert(permissions).values(permissionsData).run();

    await drizzle.insert(permissionRules).values(permission_rules).run();

    logger.info("Role seeded successfully!");
  } catch (error) {
    logger.error("Error seeding default config:", error);
    throw error;
  }
}

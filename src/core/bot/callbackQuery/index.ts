import type { NextFunction } from "grammy";

import { Context } from "../core/interface/Context";
import { categoriesAdd } from "./categoriesAdd";
import { categoriesList } from "./categoriesList";
import { categoriesSharedList } from "./categoriesSharedList";
import { detailListDelete } from "./detailListDelete";
import { detailListDetail } from "./detailListDetail";
import { detailListEditCron } from "./detailListEditCron";
import { detailListEditUrl } from "./detailListEditUrl";
import { detailListShared } from "./detailListShared";
import { detailSharedDetail } from "./detailSharedDetail";
import { detailSharedUnsubcribe } from "./detailSharedUnsubcribe";
import { indexMain } from "./indexMain";
import { mainCategories } from "./mainCategories";
import { mainSystem } from "./mainSystem";
import { roleUsersChangeRole } from "./roleUsersChangeRole";
import { roleUsersChangeRoleEnd } from "./roleUsersChangeRoleEnd";
import { roleUsersUser } from "./roleUsersUser";
import { sharedDetailCreate } from "./sharedDetailCreate";
import { systemBrowser } from "./systemBrowser";
import { systemRoleUsers } from "./systemRoleUsers";

export default {
  "main/categories": mainCategories,
  "categories/back": indexMain,
  "categories/add": categoriesAdd,
  "categories/list": categoriesList,
  "categories/add/back": mainCategories,
  "categories/sharedList": categoriesSharedList,
  "categoriesSharedList/back": mainCategories,
  "categoriesList/back": mainCategories,
  "detailList/detail": detailListDetail,
  "detailList/back": categoriesList,
  "detailList/delete": detailListDelete,
  "detailList/shared": detailListShared,
  "detailList/editUrl": detailListEditUrl,
  "detailList/editCron": detailListEditCron,
  "detailShared/detail": detailSharedDetail,
  "detailShared/back": categoriesSharedList,
  "sharedDetail/back": detailListDetail,
  "sharedDetail/create": sharedDetailCreate,
  "shared/back": detailListShared,
  "editUrl/back": detailListDetail,
  "detailShared/unsubcribe": detailSharedUnsubcribe,
  "main/system": mainSystem,
  "system/back": indexMain,
  "system/roleUsers": systemRoleUsers,
  "system/browser": systemBrowser,
  "roleUsers/back": mainSystem,
  "roleUsers/user": roleUsersUser,
  "roleUsers/changeRole": roleUsersChangeRole,
  "roleUsers/changeRoleEnd": roleUsersChangeRoleEnd,
  "browser/back": mainSystem,
} as Record<string, (ctx: Context, next: NextFunction) => Promise<void>>;

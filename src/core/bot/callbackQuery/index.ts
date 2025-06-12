import type { NextFunction } from "grammy";

import { Context } from "../core/interface/Context";
import { categoriesAdd } from "./categoriesAdd";
import { categoriesList } from "./categoriesList";
import { categoriesSharedList } from "./categoriesSharedList";
import { indexMain } from "./indexMain";
import { mainCategories } from "./mainCategories";

export default {
  "main/categories": mainCategories,
  "categories/back": indexMain,
  "categories/add": categoriesAdd,
  "categories/list": categoriesList,
  "categories/add/back": mainCategories,
  "categories/sharedList": categoriesSharedList,
  "categoriesSharedList/back": mainCategories,
  "categoriesList/back": mainCategories,
} as Record<string, (ctx: Context, next: NextFunction) => Promise<void>>;

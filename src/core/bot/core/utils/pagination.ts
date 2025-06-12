import { InlineKeyboard } from "grammy";

import { ParamsExtractorDB } from "./paramsExractorDB";

export interface Pagination {
  page: number;
  count: number;
}

const mapNumber: Record<string, string> = {
  "1": "1️⃣",
  "2": "2️⃣",
  "3": "3️⃣",
  "4": "4️⃣",
  "5": "5️⃣",
  "6": "6️⃣",
  "7": "7️⃣",
  "8": "8️⃣",
  "9": "9️⃣",
  "0": "0️⃣",
};

function range(start: number, end: number): number[] {
  if (start >= end) {
    return [];
  }

  return [...Array(end - start + 1).keys()].map(
    (key: number): number => key + start,
  );
}

const paramsPagination = async (route: string, page: number, params: any) => {
  const newParams = new ParamsExtractorDB(route);
  newParams.addParams(params);
  newParams.addParam("page", String(page));

  return await newParams.toStringAsync();
};

const convertNumberToEmoji = (number: number): string => {
  const str = String(number)
    .split("")
    .map(item => mapNumber[item] || item)
    .join("");
  return str;
};

export const createPagination = async ({
  count,
  page,
  route,
  menu: _menu,
  params,
}: Pagination & { route: string; menu?: InlineKeyboard; params: any }) => {
  const menu = _menu ?? new InlineKeyboard();
  const prevPage = Math.max(page - 1, 1);
  const nextPage = Math.min(page + 1, count);
  const lastPage = Math.min(Math.max(page + 2, 5), count);
  const firstPage = Math.max(1, lastPage - 4);
  const _range = range(firstPage, lastPage);

  if (page > 1) {
    menu.text("◀", await paramsPagination(route, prevPage, params));
  }

  let index = 1;
  for (const item of _range) {
    if (page === index) {
      index++;
      continue;
    }
    menu.text(
      convertNumberToEmoji(item),
      await paramsPagination(route, item, params),
    );
    index++;
  }

  if (page < lastPage) {
    menu.text("▶", await paramsPagination(route, nextPage, params));
  }

  menu.row();
};

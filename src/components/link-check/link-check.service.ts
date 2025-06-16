/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { sendMessage } from "@components/notification/notification.service";
import { ParamsExtractorDB } from "@core/bot/core/utils/paramsExractorDB";
import { menuButton } from "@core/bot/menu/menuButton.config";
import { drizzle } from "@core/db";
import { link as linkDB } from "@core/db/models";
import { browser } from "@core/puppeteer";
import { CompositeKeyMap } from "@core/utils/CompositeKeyMap";
import { convertPriceToNumber } from "@core/utils/convertPriceToNumber";
import type { GroupedResult } from "@core/utils/groupBy";
import { isHouseNumber } from "@core/utils/isHouseNumber";
import logger from "@core/utils/logger";
import { removeAddressKeywords } from "@core/utils/removeAddressKeywords";
import { bold, fmt, link as fmtLink } from "@grammyjs/parse-mode";
import { eq } from "drizzle-orm";
import { InlineKeyboard } from "grammy";

import {
  ComparisonResult,
  LinkCheckData,
  LinkMapResult,
} from "./link-check.interface";

function removeSaleWord(text: string): string {
  const hasSaleWord =
    /[ПпPpРр][\s\-]*[рpRrР][\s\-]*[оОoOО][\s\-]*[дДdDД][\s\-]*[аaAА][\s\-]*[ёеeEЕ][\s\-]*[тTТ][\s\-]*[сcCС][\s\-]*[яЯ]?/gi.test(
      text,
    );

  if (!hasSaleWord) return text;

  return text
    .replace(
      /([ПпPpРр])([\s\-]*)([рpRrР])([\s\-]*)([оОoOО])([\s\-]*)([дДdDД])([\s\-]*)([аaAА])([\s\-]*)([ёеeEЕ])([\s\-]*)([тTТ])([\s\-]*)([сcCС])([\s\-]*)([яЯ]?)/gi,
      "",
    )
    .replace(/\s+/g, " ")
    .trim();
}

function compareObjects<
  T1 extends Record<string, unknown>,
  T2 extends Record<string, unknown>,
>(obj1: T1, obj2: T2): ComparisonResult<T1 & T2> {
  const result: ComparisonResult<T1 & T2> = {
    isEqual: true,
    differences: {} as T1 & T2,
  };

  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

  for (const key of allKeys) {
    if (obj1[key] !== obj2[key]) {
      result.isEqual = false;
      (result.differences as Record<string, unknown>)[key] = obj1[key];
    }
  }

  return result;
}

const linkCian = async (config: typeof linkDB.$inferSelect) => {
  const page = await browser.CreatePage();

  if (!config.url) {
    throw new Error("URL not found");
  }

  await page
    .goto(config.url, { waitUntil: "domcontentloaded", timeout: 15000 })
    .catch(() => {
      logger.info("Error while navigating to the page");
      return null;
    });

  const titleText = await page
    .$eval('div[data-name="OfferTitleNew"]>h1', el => el.textContent)
    .catch(() => {
      logger.info("Error while getting title text");
      return null;
    });

  if (!titleText) {
    throw new Error("No title found");
  }

  const [titleDirty, square] = titleText.split(", ");

  const title = removeSaleWord(titleDirty);

  const sectionInfoBuild = await page
    .$('div[data-name="ObjectFactoids"]')
    .catch(() => {
      logger.info("No sectionInfoBuild found");
      return null;
    });

  const floorText = sectionInfoBuild
    ? await sectionInfoBuild
        .evaluate(section => {
          const factoidItems = Array.from(
            section.querySelectorAll('div[data-name="ObjectFactoidsItem"]'),
          );
          for (const item of factoidItems) {
            const labelEl = item.querySelector("div~div>span");
            if (labelEl && labelEl.textContent?.trim() === "Этаж") {
              const valueEl = item.querySelector("div~div>span~span");
              return valueEl ? valueEl.textContent?.trim() : null;
            }
          }
          return null;
        })
        .catch(() => {
          logger.info("Error while getting floor text:");
          return null;
        })
    : null;

  const floorAndMax = floorText?.split(" из ") ?? [null, null];

  const [floor = null, maxFloor = null] = floorAndMax;

  const priceText = await page
    .$eval('div[data-testid="price-amount"]>span', el => el.textContent)
    .catch(() => {
      logger.info("Error while getting price:");
      return null;
    });

  const price = convertPriceToNumber(priceText);

  const locationSelectors = await page
    .$$('a[data-name="AddressItem"]')
    .catch(() => {
      logger.info("No location selectors found");
      return [];
    });

  const houseElement = locationSelectors.at(-1);

  const houseText = houseElement
    ? await houseElement.evaluate(el => el.textContent)
    : null;

  const house = isHouseNumber(houseText) ? houseText : null;

  const streetElement = locationSelectors.at(house === null ? -1 : -2);

  const street = streetElement
    ? await streetElement
        .evaluate(el => el.textContent)
        .then(text =>
          text
            ? removeAddressKeywords(text.toLocaleLowerCase(), [
                {
                  regex: /(^|\s|\.|,)ул\.\s+([^,]+?)(\s|$|,|\.)/gi,
                  replace: "$1$2$3",
                },
                {
                  regex: /(^|\s|\.|,)ул\s+([^,]+?)(\s|$|,|\.)/gi,
                  replace: "$1$2$3",
                },
                { regex: /(^|\s|\.|,)ул\.?(\p{L}+)/giu, replace: "$1$2" },
                { regex: /(\p{L}+)(\sул\.?)(\s|$|,|\.)/giu, replace: "$1$3" },
                {
                  regex: /(.+?)\sжилой\sкомплекс([,\s]|$)/gi,
                  replace: "$1$2",
                },
                {
                  regex: /(^|\s)(\p{L}+)\sбул\.?(\s|$|,|\.)/giu,
                  replace: "$1$2$3",
                },
                {
                  regex: /(^|\s)(\p{L}+)\sмкр\.?(\s|$|,|\.)/giu,
                  replace: "$1$2$3",
                },
                {
                  regex: /(^|\s)(\p{L}+)\sпросп\.?(\s|$|,|\.)/giu,
                  replace: "$1$2$3",
                },
                {
                  regex: /(^|,\s*)(жилой\sкомплекс|жк)\s+/gi,
                  replace: "$1",
                },
                {
                  regex: /(^|\s)(\p{L}+)\sш.\.?(\s|$|,|\.)/giu,
                  replace: "$1$2$3",
                },
                {
                  regex: /(^|\s)(\p{L}+)\sнаб.\.?(\s|$|,|\.)/giu,
                  replace: "$1$2$3",
                },
                {
                  regex: /(^|\s)(\p{L}+)\sквартал.\.?(\s|$|,|\.)/giu,
                  replace: "$1$2$3",
                },
              ])
            : null,
        )
    : null;

  const smallDescription = await page
    .$eval(
      'div[data-name="Description"]>div>div>div>span',
      el => el.textContent,
    )
    .catch((e: unknown) => {
      logger.info(e);
      return null;
    });

  const sellerName =
    (await page
      .$eval(
        'div[data-testid="AgencyBrandingAsideCard"]>div>div>div>div~div>div>div>div>a>span',
        el => el.textContent,
      )
      .catch((e: unknown) => {
        logger.info(e);
        return null;
      })) ??
    (await page
      .$eval(
        'div[data-name="AgentInfoLayout"]>div>a>span',
        el => el.textContent,
      )
      .catch((e: unknown) => {
        logger.info(e);
        return null;
      })) ??
    (await page
      .$eval(
        'div[data-name="AuthorAside"]>div>div>div>a>div>span~span',
        el => el.textContent,
      )
      .catch((e: unknown) => {
        logger.info(e);
        return null;
      })) ??
    (await page
      .$eval(
        'div[data-name="AuthorAside"]>div>div>span~span',
        el => el.textContent,
      )
      .catch((e: unknown) => {
        logger.info(e);
        return null;
      })) ??
    (await page
      .$eval(
        'div[data-name="AuthorAside"]>div>div>div>span',
        el => el.textContent,
      )
      .catch((e: unknown) => {
        logger.info(e);
        return null;
      })) ??
    null;

  await page.close();

  const newData = {
    title,
    square,
    floor,
    maxFloor,
    price,
    house,
    street,
    sellerName,
    smallDescription,
  };

  const dbData = {
    title: config.title,
    square: config.square,
    floor: config.floor,
    maxFloor: config.floor_count,
    price: config.price,
    house: config.house,
    street: config.address,
    sellerName: config.seller_name,
    smallDescription: config.small_description,
  };

  const { isEqual, differences } = compareObjects(newData, dbData);

  if (isEqual) {
    return null;
  }

  return differences;
};

const mapAds = {
  cian: linkCian,
};

const checkNewInfo = async (links: (typeof linkDB.$inferSelect)[]) => {
  const newLinksIds: LinkCheckData[] = [];

  for (const linkItem of links) {
    const url = linkItem.url;

    if (!url) {
      throw new Error("URL not found");
    }

    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname.split(".").at(-2);

    if (!domain) {
      throw new Error("Domain not found");
    }

    if (!domain) {
      throw new Error("Domain not found");
    }

    const callback = mapAds[domain as keyof typeof mapAds];

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!callback) {
      throw new Error("Domain not supported");
    }

    const newLinkItem = (await callback(linkItem)) as LinkCheckData | null;

    if (newLinkItem === null) continue;

    newLinksIds.push({ ...newLinkItem, id: linkItem.id });
  }

  return newLinksIds;
};

const mapLinkCheckData = (linkData: LinkCheckData): LinkMapResult => {
  return {
    id: linkData.id,
    title: linkData.title ?? undefined,
    square: linkData.square ?? undefined,
    floor: linkData.floor ?? undefined,
    floor_count: linkData.maxFloor ?? undefined,
    price: linkData.price ?? undefined,
    house: linkData.house ?? undefined,
    address: linkData.street ?? undefined,
    seller_name: linkData.sellerName ?? undefined,
    small_description: linkData.smallDescription ?? undefined,
  };
};

const updateLinks = async (links: LinkMapResult[]): Promise<void> => {
  await drizzle.transaction(async tx => {
    for (const itemLink of links) {
      await tx.update(linkDB).set(itemLink).where(eq(linkDB.id, itemLink.id));
    }
  });
};

const sendNotifications = async (
  resorceLinks: Record<string, typeof linkDB.$inferSelect>,
  chatsId: GroupedResult<{
    id: number;
    linkId: number;
    chatId: string;
    enable: number;
  }>,
  links: Record<string, LinkMapResult>,
) => {
  for (const [chatId, watchLinks] of Object.entries(chatsId)) {
    const idsLink = watchLinks.map(item => item.linkId);
    const linksToNotify = idsLink.map(id => links[id]).filter(Boolean);
    const linkMap = new CompositeKeyMap(watchLinks, ["linkId", "chatId"]);

    for (const link of linksToNotify) {
      const watchlink = linkMap.get({
        linkId: link.id,
        chatId,
        id: undefined,
        enable: undefined,
      });

      await sendNotification(resorceLinks[link.id], link, chatId, watchlink);
    }
  }
};

const sendNotification = async (
  resorceLinks: typeof linkDB.$inferSelect,
  link: LinkMapResult,
  chatId: string,
  watchLink:
    | {
        id: number;
        linkId: number;
        chatId: string;
        enable: number;
      }
    | undefined,
) => {
  const active = watchLink?.enable ?? false;

  const status = active ? "🔕" : "🔔";

  const msg = messageNotification(resorceLinks, link);

  const menu = new InlineKeyboard();

  const params = new ParamsExtractorDB(menuButton.watchLink.toggle.data);

  params.addParams({
    linkId: link.id,
    watchLinkId: watchLink?.id,
    toggle: watchLink ? (active ? "false" : "true") : undefined,
  });

  menu.text(
    `${status} ${active ? "Не отслеживать" : "Отслеживать"}`,
    await params.toStringAsync(),
  );

  await sendMessage(chatId, msg.text, {
    entities: msg.entities,
    reply_markup: menu,
  });
};

const messageNotification = (
  config: typeof linkDB.$inferSelect,
  newConfig: LinkMapResult,
) => {
  const description =
    newConfig.small_description ?? config.small_description ?? "";
  const msg = fmt`Данное объявление поменялось

${config.title ? fmt`🏠 ${newConfig.title ?? config.title},` : ""} ${bold(newConfig.square ?? config.square!)}
${config.price ? fmt`💵 ${Number(newConfig.price ?? config.price).toLocaleString("ru-RU", { style: "currency", currency: "RUB", minimumFractionDigits: 0, maximumFractionDigits: 0 })} ${newConfig.price && newConfig.price > config.price ? "⬆️" : "⬇️"}` : ""}
🌎 Ул. ${newConfig.address ?? config.address!}, ${fmt`дом ${newConfig.house ?? config.house!}`}
${fmt`👤 Продавец - ${bold(newConfig.seller_name ?? config.seller_name!)}`}
${fmt`🪜 Этаж - ${bold(config.floor! + " / " + config.floor_count!)}`}
${fmt`\n${description.length > 255 ? description.slice(0, 255) + "..." : description}`}

⌚️${
    config.date_published
      ? fmt`Добавлено ${new Date(config.date_published).toLocaleString(
          "ru-RU",
          {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          },
        )} по МСК`
      : ""
  }
${config.url ? fmt`🔗${fmtLink("Ссылка на объявление", config.url)}` : ""}
  `;
  return msg;
};

export { checkNewInfo, mapLinkCheckData, sendNotifications, updateLinks };

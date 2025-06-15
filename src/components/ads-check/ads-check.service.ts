import { drizzle } from "@core/db";
import { link, trackedLinks } from "@core/db/models";
import { browser } from "@core/puppeteer";
import { compareDates, parseRussianDate } from "@core/utils/compareDates";
import { convertPriceToNumber } from "@core/utils/convertPriceToNumber";
import { isHouseNumber } from "@core/utils/isHouseNumber";
import logger from "@core/utils/logger";
import { removeAddressKeywords } from "@core/utils/removeAddressKeywords";
import crypto from "crypto";
import { and, eq, inArray } from "drizzle-orm";
import * as puppeteer from "puppeteer";

import { AdsCheck } from "./ads-check.interface";

const openPage = async (url: string) => {
  const page = await browser.CreatePage();
  await page.goto(url, { waitUntil: "domcontentloaded" });
  return page;
};

const generateHash = (
  obj: Omit<AdsCheck, "hash" | "datePublished" | "url">,
) => {
  const str = JSON.stringify(obj, Object.keys(obj).sort());
  return crypto.createHash("sha256").update(str).digest("hex");
};

const itemAdsAvito = async (
  item: puppeteer.ElementHandle<HTMLDivElement>,
  config: typeof trackedLinks.$inferInsert,
  hostname: string,
) => {
  const titleText = await item.$eval(
    'a[data-marker="item-title"]',
    el => el.textContent,
  );

  if (!titleText) {
    throw new Error("No title found");
  }

  const [title, square, floorText] = titleText.split(", ");

  if (!floorText) {
    throw new Error("No title or square found");
  }

  const floorAndMax = floorText.split(" ")[0];

  if (!floorAndMax) {
    throw new Error("No floor found");
  }

  const [floor, maxFloor] = floorAndMax.split("/");

  const smallDescription = await item.$eval(
    'meta[itemprop="description"]',
    el => el.getAttribute("content"),
  );

  if (!smallDescription) {
    throw new Error("No description found");
  }

  const sellerName = await item.$eval(
    'a>p[style="--module-max-lines-size:1"]',
    el => el.textContent,
  );

  if (!sellerName) {
    throw new Error("No sellerName found");
  }

  const price = await item.$eval('meta[itemprop="price"]', el =>
    el.getAttribute("content"),
  );

  if (!price) {
    throw new Error("No price found");
  }

  const street = await item.$eval(
    'a[data-marker="street_link"]',
    el => el.textContent,
  );

  if (!street) {
    throw new Error("No street found");
  }

  const house = await item.$eval(
    'a[data-marker="house_link"]',
    el => el.textContent,
  );

  if (!house) {
    throw new Error("No house found");
  }

  const url = await item.$eval('a[itemprop="url"]', el =>
    el.getAttribute("href"),
  );

  if (!url) {
    throw new Error("No url found");
  }

  const detailPage = await browser.CreatePage();
  await detailPage.goto(hostname + url, { waitUntil: "networkidle2" });

  const datePublished = await detailPage.$eval(
    'span[data-marker="item-view/item-date"]',
    el => el.textContent,
  );

  await detailPage.close();

  const hash = generateHash({
    title,
    square,
    floor,
    maxFloor,
    smallDescription,
    sellerName,
    street,
    price,
    house,
  });

  return {
    title,
    square,
    floor,
    maxFloor,
    smallDescription,
    price,
    sellerName,
    street,
    house,
    url: hostname + url,
    datePublished,
    hash,
  };
};

const checkTitleText = (titleText: string[]) => {
  if (
    titleText.length === 3 &&
    titleText[1].includes("м²") &&
    titleText[2].includes("/")
  ) {
    return true;
  }
  return false;
};

const itemAdsCian = async (
  item: puppeteer.ElementHandle<HTMLElement>,
  config: typeof trackedLinks.$inferSelect,
) => {
  const datePublishedStr = await item.$eval(
    'div[data-name="TimeLabel"]>div~div>span',
    el => el.textContent,
  );

  if (!datePublishedStr) {
    return null;
  }

  const isNotOld = compareDates(datePublishedStr, config.updated_at);

  if (!isNotOld) {
    return null;
  }

  const datePublished = parseRussianDate(datePublishedStr).toSQL();

  let titleText =
    (await item
      .$eval('span[data-mark="OfferTitle"]>span', el => el.textContent)
      .catch((e: unknown) => {
        logger.info(e);
        return null;
      })) ?? null;

  let splitTitleText = titleText?.split(", ") ?? [];

  if (!checkTitleText(splitTitleText)) {
    titleText = await item
      .$eval('span[data-mark="OfferSubtitle"]', el => el.textContent)
      .catch((e: unknown) => {
        logger.info(e);
        return null;
      });
    splitTitleText = titleText?.split(", ") ?? [];
  }

  const [title = null, square = null, floorText] = splitTitleText;

  const [floor, maxFloor] = floorText
    ? floorText.split(" ")[0].split("/")
    : [null, null];

  const smallDescription = await item
    .waitForSelector('div[data-name="Description"]>p', { timeout: 30000 })
    .then(el => el?.evaluate(el => el.textContent) ?? null)
    .catch((e: unknown) => {
      logger.info(e);
      return null;
    });

  let sellerName =
    (await item
      .$eval(
        'div[data-name="BrandingLevelWrapper"]>div>div~div>div>div>div>a>span',
        el => el.textContent,
      )
      .catch((e: unknown) => {
        logger.info(e);
        return null;
      })) ??
    (await item
      .$eval(
        'div[data-name="BrandingLevelWrapper"]>div>div~div>div>div>div>span',
        el => el.textContent,
      )
      .catch((e: unknown) => {
        logger.info(e);
        return null;
      })) ??
    null;

  const priceText =
    (await item
      .$eval('span[data-mark="MainPrice"]>span', el => el.textContent)
      .catch((e: unknown) => {
        logger.info(e);
        return null;
      })) ??
    (await item
      .$eval(
        'span[data-testid="offer-discount-new-price"]',
        el => el.textContent,
      )
      .catch((e: unknown) => {
        logger.info(e);
        return null;
      })) ??
    null;

  const price = convertPriceToNumber(priceText);

  const locationSelectors = await item.$$('a[data-name="GeoLabel"]');

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
                { regex: /(^|\s|\.|,)улица(\p{L}+)/giu, replace: "$1$2" },
                {
                  regex: /(^|\s|\.|,)улица\s+([^,]+?)(\s|$|,|\.)/gi,
                  replace: "$1$2$3",
                },
                {
                  regex: /(^|\s)(\p{L}+)\sбульвар(\s|$|,|\.)/giu,
                  replace: "$1$2$3",
                },
                {
                  regex: /(^|\s)(\p{L}+)\sмикрорайон(\s|$|,|\.)/giu,
                  replace: "$1$2$3",
                },
                {
                  regex: /(^|\s)(\p{L}+)\sпроспект(\s|$|,|\.)/giu,
                  replace: "$1$2$3",
                },
                {
                  regex: /(^|\s)(\p{L}+)\sшоссе(\s|$|,|\.)/giu,
                  replace: "$1$2$3",
                },
                {
                  regex: /(^|\s)(\p{L}+)\sнабережная(\s|$|,|\.)/giu,
                  replace: "$1$2$3",
                },
                { regex: /(\p{L}+)(\sулица)(\s|$|,|\.)/giu, replace: "$1$3" },
                { regex: /(^|\s|\.|,)жк(\p{L}+)/giu, replace: "$1$2" },
                { regex: /(\p{L}+)(\sжк)(\s|$|,|\.)/giu, replace: "$1$3" },
              ])
            : null,
        )
    : null;

  const url = await item.$eval('div[data-testid="offer-card"]>a', el =>
    el.getAttribute("href"),
  );

  const hash = generateHash({
    title,
    square,
    floor,
    maxFloor,
    smallDescription,
    sellerName,
    street,
    price,
    house,
  });

  return {
    title,
    square,
    floor,
    maxFloor,
    smallDescription,
    price,
    sellerName,
    street,
    house,
    url,
    datePublished,
    hash,
  };
};

const adsAvito = async (
  page: puppeteer.Page,
  config: typeof trackedLinks.$inferInsert,
): Promise<AdsCheck[]> => {
  const lists = await page.waitForSelector("div#bx_serp-item-list");

  if (!lists) {
    throw new Error("No lists found");
  }

  const items = await lists.$$(`div[data-marker="item"]`);

  const url = config.url;
  const parsedUrl = new URL(url);

  const res: AdsCheck[] = [];

  for (const item of items) {
    try {
      await itemAdsAvito(item, config, parsedUrl.origin);
    } catch (error) {
      if (error instanceof Error) {
        logger.error(error.message);
      }
    }
  }

  return res;
};

const adsCian = async (
  page: puppeteer.Page,
  config: typeof trackedLinks.$inferSelect,
): Promise<AdsCheck[]> => {
  const lists = await page.waitForSelector('div[data-name="Offers"]');

  if (!lists) {
    throw new Error("No lists found");
  }

  const items = await lists.$$(`article[data-name="CardComponent"]`);

  const res = [];

  for (const item of items) {
    try {
      const ad = await itemAdsCian(item, config);
      if (!ad) continue;
      res.push(ad);
    } catch (error) {
      if (error instanceof Error) {
        logger.error(error.message);
      }
    }
  }

  return res;
};

const mapAds = {
  avito: adsAvito,
  cian: adsCian,
};

const checkAds = async (
  page: puppeteer.Page,
  config: typeof trackedLinks.$inferSelect,
): Promise<AdsCheck[]> => {
  const url = config.url;
  const parsedUrl = new URL(url);
  const domain = parsedUrl.hostname.split(".").at(-2);

  if (!domain) {
    throw new Error("Domain not found");
  }

  const callback = mapAds[domain as keyof typeof mapAds];

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!callback) {
    throw new Error("Domain not supported");
  }

  return await callback(page, config);
};

const checkIncludedLinks = async (
  ads: AdsCheck[],
  config: typeof trackedLinks.$inferSelect,
) => {
  if (ads.length === 0) return [];

  const { id } = config;

  const existingLinks = await drizzle
    .select()
    .from(link)
    .where(
      and(
        eq(link.trackedLinkId, id),
        inArray(
          link.hash,
          ads.map(ad => ad.hash),
        ),
      ),
    )
    .all();

  const existingHashes = new Set(existingLinks.map(l => l.hash));

  return ads.filter(ad => !existingHashes.has(ad.hash));
};

const createLinks = async (
  ads: AdsCheck[],
  config: typeof trackedLinks.$inferSelect,
): Promise<(typeof link.$inferSelect)[]> => {
  if (ads.length === 0) return [];

  const { id } = config;

  const links = ads.map(ad => ({
    title: ad.title,
    url: ad.url,
    square: ad.square,
    floor: ad.floor,
    floor_count: ad.maxFloor,
    small_description: ad.smallDescription,
    price: ad.price,
    seller_name: ad.sellerName,
    address: ad.street,
    house: ad.house,
    date_published: ad.datePublished,
    hash: ad.hash,
    trackedLinkId: id,
  })) as (typeof link.$inferInsert)[];

  return await drizzle.insert(link).values(links).returning();
};

export { checkAds, checkIncludedLinks, createLinks, generateHash, openPage };

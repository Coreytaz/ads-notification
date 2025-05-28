/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { drizzle } from "@core/db";
import { link, trackedLinks } from "@core/db/models";
import { browser } from "@core/puppeteer";
import { compareDates, parseRussianDate } from "@core/utils/compareDates";
import logger from "@core/utils/logger";
import { and, eq, inArray } from "drizzle-orm";
import md5 from "md5";
import * as puppeteer from "puppeteer";

import { AdsCheck } from "./ads-check.interface";

const getTrackedLinksById = async (id: number) => {
  return await drizzle
    .select()
    .from(trackedLinks)
    .where(eq(trackedLinks.id, id))
    .get();
};

const openPage = async (url: string) => {
  const page = await browser.CreatePage();
  await page.goto(url, { waitUntil: "networkidle2" });
  return page;
};

const generateHash = (str: Omit<AdsCheck, "hash" | "datePublished">) => {
  return md5(JSON.stringify(str));
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
    url,
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

  const titleText = await item.$eval(
    'span[data-mark="OfferTitle"]>span',
    el => el.textContent,
  );

  const [title = null, square = null, floorText] = (titleText ?? "").split(
    ", ",
  );

  const [floor, maxFloor] = floorText
    ? floorText.split(" ")[0].split("/")
    : [null, null];

  const smallDescription = await item
    .$eval('div[data-name="Description"]>p', el => el.textContent)
    .catch((e: unknown) => {
      logger.info(e);
      return null;
    });

  let sellerName = await item
    .$eval(
      'div[data-name="BrandingLevelWrapper"]>div>div~div>div>div>div>a>span',
      el => el.textContent,
    )
    .catch((e: unknown) => {
      logger.info(e);
      return null;
    });

  const price =
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

  const locationSelectors = await item.$$('a[data-name="GeoLabel"]');

  const streetElement = locationSelectors.at(-2);

  const street = streetElement
    ? await streetElement.evaluate(el => el.textContent)
    : null;

  const houseElement = locationSelectors.at(-1);
  const house = houseElement
    ? await houseElement.evaluate(el => el.textContent)
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
    url,
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
) => {
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

  await drizzle.insert(link).values(links);

  return links;
};

export {
  checkAds,
  checkIncludedLinks,
  createLinks,
  getTrackedLinksById,
  openPage,
};

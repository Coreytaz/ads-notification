import { trackedLinks } from "@core/db/models";
import { browser as _browser } from "@core/puppeteer";
import AppError from "@core/utils/appError";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import {
  checkAds,
  checkIncludedLinks,
  createLinks,
  getTrackedLinksById,
  openPage,
} from "./ads-check.service";

export const adsCheck = async (config: typeof trackedLinks.$inferSelect) => {
  const page = await openPage(config.url);

  const ads = await checkAds(page, config);

  await page.close();

  const includedAds = await checkIncludedLinks(ads, config);

  return await createLinks(includedAds, config);
};

const adsCheckGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const config = await getTrackedLinksById(1);

    if (!config) throw new Error("Tracked link not found");

    const links = await adsCheck(config);

    res.status(StatusCodes.OK).json({
      status: "ok",
      links,
    });
  } catch (error) {
    if (error instanceof Error) {
      const browser = _browser.GetBrowserInstance();
      if (browser.connected) {
        const pages = await browser.pages();
        for (const page of pages) {
          await page.close();
        }
      }
      next(new AppError(StatusCodes.INTERNAL_SERVER_ERROR, error.message));
    }
  }
};

export { adsCheckGet };

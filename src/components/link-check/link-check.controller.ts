import { getAllEnableWatchLink, getLinkIds, reduceIds } from "@core/db/models";
import { browser as _browser } from "@core/puppeteer";
import AppError from "@core/utils/appError";
import { groupBy } from "@core/utils/groupBy";
import logger from "@core/utils/logger";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { checkNewInfo } from "./link-check.service";

const linkCheck = async () => {
  try {
    const watchLinks = await getAllEnableWatchLink();

    const idsLink = watchLinks.map(link => link.linkId);

    const links = await getLinkIds(idsLink);

    const newLinkIds = await checkNewInfo(links);

    // const linksReduce = reduceIds(links);

    // const groupWatchLinks = groupBy(watchLinks, "chatId");

    return { newLinkIds };
  } catch (error) {
    logger.info("Error in linkCheck:", error);
  }
};

const linkCheckGet = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const watchLinks = await linkCheck();

    res.status(StatusCodes.OK).json({
      status: "ok",
      watchLinks,
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

export { linkCheckGet };

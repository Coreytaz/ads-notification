import { getAllEnableWatchLink, getLinkByIds, reduceIds } from "@core/db/models";
import { browser as _browser } from "@core/puppeteer";
import AppError from "@core/utils/appError";
import { groupBy } from "@core/utils/groupBy";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import {
  checkNewInfo,
  mapLinkCheckData,
  sendNotifications,
  updateLinks,
} from "./link-check.service";

const linkCheck = async () => {
  const watchLinks = await getAllEnableWatchLink();

  const idsLink = [...new Set(watchLinks.map(link => link.linkId))];

  const links = await getLinkByIds(idsLink);

  const newLinks = await checkNewInfo(links);

  const mapLinks = newLinks.map(mapLinkCheckData);

  await updateLinks(mapLinks);

  const linksReduce = reduceIds(mapLinks);

  const groupWatchChatId = groupBy(watchLinks, "chatId");

  sendNotifications(groupWatchChatId, linksReduce);

  return { mapLinks, linksReduce, groupWatchChatId };
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

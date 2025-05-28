import { browser as _browser } from "@core/puppeteer";
import AppError from "@core/utils/appError";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const linkCheckGet = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.status(StatusCodes.OK).json({
      status: "ok",
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

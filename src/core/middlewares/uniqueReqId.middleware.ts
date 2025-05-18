import consts from "@config/consts";
import logger from "@core/utils/logger";
import { NextFunction, Request, Response } from "express";
import httpContext from "express-http-context";
import { v4 as uuidv4 } from "uuid";

const { CONTEXT_KEYS } = consts;

const uniqueReqId = (req: Request, res: Response, next: NextFunction) => {
  httpContext.set(CONTEXT_KEYS.REQ_ID, uuidv4());
  logger.info(`START Request Id: ${httpContext.get(CONTEXT_KEYS.REQ_ID)}`);
  res.on("finish", () => {
    logger.info(`END Request Id: ${httpContext.get(CONTEXT_KEYS.REQ_ID)}`);
  });
  next();
};

export default uniqueReqId;

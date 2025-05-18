import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const healthcheck = (req: Request, res: Response) => {
  res.status(StatusCodes.OK);
  res.json({
    status: "ok",
    date: new Date().toJSON(),
  });
};

export default healthcheck;

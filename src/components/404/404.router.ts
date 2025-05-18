import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";

const router: Router = Router();
const resBody = StatusCodes.NOT_FOUND;
router.all("*splat", (req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).json(resBody);
});

export default router;

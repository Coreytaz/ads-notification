import { Router } from "express";

import { linkCheckGet } from "./link-check.controller";

const router: Router = Router();

router.get("/link-check", linkCheckGet);

export default router;

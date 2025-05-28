import { Router } from "express";

import { adsCheckGet } from "./ads-check.controller";

const router: Router = Router();

router.get("/ads-check", adsCheckGet);

export default router;

import adsCheck from "@components/ads-check/ads-check.router";
import healthcheck from "@components/healthcheck/healthCheck.router";
import linkCheck from "@components/link-check/link-check.router";
import { Router } from "express";

const router: Router = Router();

router.use(healthcheck);
router.use(adsCheck);
router.use(linkCheck);

export default router;

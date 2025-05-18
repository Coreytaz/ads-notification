import healthcheck from "@components/healthcheck/healthCheck.controller";
import { Router } from "express";

const router: Router = Router();

router.use(healthcheck);

export default router;

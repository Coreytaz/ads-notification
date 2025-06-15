import { Router } from "express";

import notificationDemo from "./notification.controller";

const router: Router = Router();

router.get("/notification", notificationDemo);

export default router;

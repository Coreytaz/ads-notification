import http404 from "@components/404/404.router";
import consts from "@config/consts";
import { runInitialSeeders } from "@core/db/utils/runInitialSeeders";
import uniqueReqId from "@core/middlewares/uniqueReqId.middleware";
import { browser } from "@core/puppeteer";
import httpLogger from "@core/utils/httpLogger";
import cors from "cors";
import express, { Application } from "express";
import httpContext from "express-http-context";

import api from "./api";

const app: Application = express();

app.use(httpContext.middleware);
app.use(httpLogger.successHandler);
app.use(httpLogger.errorHandler);
app.use(uniqueReqId);

app.use(consts.API_ROOT_PATH_V1, api);

app.use(http404);

app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: "Content-Type, Authorization",
  }),
);

// seeders
await runInitialSeeders()
//

// puppeteer
void browser.Init()
//

export default app;

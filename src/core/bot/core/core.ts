import config from "@config/config";
import { Bot } from "grammy";

import { Context } from "./interface/Context";

const bot = new Bot<Context>(config.tgBotToken);

export default bot;

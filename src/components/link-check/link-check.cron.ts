import { browser } from "@core/puppeteer";
import { CronJob } from "cron";

import { linkCheck } from "./link-check.controller";

async function lickCheckCronCallback() {
  try {
    await linkCheck();
  } catch (error) {
    if (error instanceof Error) {
      const _browser = browser.GetBrowserInstance();
      if (_browser.connected) {
        const pages = await _browser.pages();
        for (const page of pages) {
          await page.close();
        }
      }
    }
  }
}

const jobLinkCheck = new CronJob(
  "*/2 * * * *",
  lickCheckCronCallback,
  null,
  false,
  "Europe/Moscow",
);

export { jobLinkCheck };

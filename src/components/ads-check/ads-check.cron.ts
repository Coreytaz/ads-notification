import { drizzle } from "@core/db";
import { getAllTrackedLinks, trackedLinks } from "@core/db/models";
import { browser as _browser } from "@core/puppeteer";
import logger from "@core/utils/logger";
import { CronJob, CronTime } from "cron";
import { eq } from "drizzle-orm";

import { adsCheck } from "./ads-check.controller";

type JobStore = Record<number, CronJob>;

class CronManager {
  private jobs: JobStore = {};
  private timeZone = "Europe/Moscow";

  public async init() {
    const configs = await getAllTrackedLinks();
    configs.forEach(config => {
      this.addJob(config);
    });
  }

  public addJob(config: typeof trackedLinks.$inferSelect) {
    try {
      const id = config.id;

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (this.jobs[id]) {
        void this.jobs[id].stop();
      }

      const job = new CronJob(
        config.cronTime,
        () => this.executeJob(config),
        null,
        Boolean(config.enable) || false,
        this.timeZone,
      );

      this.jobs[id] = job;
    } catch (error) {
      logger.error(error);
    }
  }

  public setTime(id: number, value: string) {
    try {
      const job = this.jobs[id];
      job.setTime(new CronTime(value, this.timeZone));
    } catch (error) {
      logger.error(error);
    }
  }

  public async toggle(id: number, value: boolean) {
    const job = this.jobs[id];
    if (value) job.start();
    else await job.stop();
  }

  public async removeJob(id: number) {
    const item = this.jobs[id];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (this.jobs) {
      await item.stop();
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this.jobs[id];
    }
  }

  private async executeJob(config: typeof trackedLinks.$inferSelect) {
    try {
      await adsCheck(config);
    } catch (error) {
      if (error instanceof Error) {
        const browser = _browser.GetBrowserInstance();
        if (browser.connected) {
          const pages = await browser.pages();
          for (const page of pages) {
            await page.close();
          }
        }
      }
    }
  }
}

export const cronManager = new CronManager();

export const searchConfigsController = {
  async toggle(id: number, value: number) {
    await drizzle
      .update(trackedLinks)
      .set({ enable: value })
      .where(eq(trackedLinks.id, id));

    await cronManager.toggle(id, Boolean(value));
  },

  async changeCron(id: number, value: string) {
    await drizzle
      .update(trackedLinks)
      .set({ cronTime: value })
      .where(eq(trackedLinks.id, id));

    cronManager.setTime(id, value);
  },

  async delete(id: number) {
    await drizzle.delete(trackedLinks).where(eq(trackedLinks.id, id));
    await cronManager.removeJob(id);
  },
};

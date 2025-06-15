import { getAllTrackedLinks, trackedLinks } from "@core/db/models";
import { browser as _browser } from "@core/puppeteer";
import logger from "@core/utils/logger";
import { CronJob, CronTime } from "cron";

import { adsCheck } from "./ads-check.controller";

type JobStore = Record<number, CronJob>;

class CronManager {
  private jobs: JobStore = {};
  private configs: Record<number, typeof trackedLinks.$inferSelect> = {};
  private timeZone = "Europe/Moscow";

  public async init() {
    const configs = await getAllTrackedLinks();
    configs.forEach(config => {
      const id = config.id;
      this.setConfig(config);
      this.addJob(id);
    });
  }

  public setConfig(configs: typeof trackedLinks.$inferSelect) {
    this.configs[configs.id] = configs;
  }

  public addJob(id: (typeof trackedLinks.$inferSelect)["id"]) {
    try {
      const config = this.configs[id];

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (this.jobs[id]) {
        void this.jobs[id].stop();
      }

      const job = new CronJob(
        config.cronTime,
        () => this.executeJob(id),
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

  private async executeJob(id: (typeof trackedLinks.$inferSelect)["id"]) {
    try {
      const config = this.configs[id];
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

export const cronManagerAds = new CronManager();

export const cronControllerAds = {
  addJob(config: typeof trackedLinks.$inferSelect) {
    cronManagerAds.setConfig(config);
    cronManagerAds.addJob(config.id);
  },

  changeConfig(config: typeof trackedLinks.$inferSelect) {
    cronManagerAds.setConfig(config);
  },

  async toggle(id: number, value: number) {
    await cronManagerAds.toggle(id, Boolean(value));
  },

  changeCron(id: number, value: string) {
    cronManagerAds.setTime(id, value);
  },

  async delete(id: number) {
    await cronManagerAds.removeJob(id);
  },
};

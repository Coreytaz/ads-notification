import {
  messageNotification,
  sendMessage,
} from "@components/notification/notification.service";
import { ParamsExtractorDB } from "@core/bot/core/utils/paramsExractorDB";
import { menuButton } from "@core/bot/menu/menuButton.config";
import {
  getAllSharedLinks,
  getAllTrackedLinks,
  getAllWatchLink,
  trackedLinks,
  watchLink,
} from "@core/db/models";
import { browser as _browser } from "@core/puppeteer";
import { CompositeKeyMap } from "@core/utils/CompositeKeyMap";
import logger from "@core/utils/logger";
import { CronJob, CronTime } from "cron";
import { inArray } from "drizzle-orm";
import { InlineKeyboard } from "grammy";

import { adsCheck } from "./ads-check.controller";

type JobStore = Record<number, CronJob>;

class CronManager {
  private jobs: JobStore = {};
  private configs: Record<number, typeof trackedLinks.$inferSelect> = {};
  private timeZone = "Europe/Moscow";

  public async init() {
    const configs = await getAllTrackedLinks({ enable: 1 });
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
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (job) {
      if (value) job.start();
      else await job.stop();
    } else {
      this.addJob(id);
    }
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
      const newsAds = await adsCheck(config);
      const sharedLinks = await getAllSharedLinks({ trackedLinkId: id });
      const newsIds = newsAds.map(ad => ad.id);

      const idsNotification = [
        config.chatId,
        ...sharedLinks.map(link => link.chatId),
      ];

      const watchLinks = await getAllWatchLink(
        {},
        inArray(watchLink.linkId, newsIds),
        inArray(watchLink.chatId, idsNotification),
      );

      const linkMap = new CompositeKeyMap(watchLinks, ["linkId", "chatId"]);

      for (const chatId of idsNotification) {
        for (const newAds of newsAds) {
          const linkId = newAds.id;

          const watchLink = linkMap.get({
            linkId,
            chatId,
            id: undefined,
            enable: undefined,
          });

          const active = watchLink?.enable ?? false;

          const status = active ? "🔕" : "🔔";

          const msg = messageNotification(config, newAds);

          const menu = new InlineKeyboard();

          const params = new ParamsExtractorDB(
            menuButton.watchLink.toggle.data,
          );

          params.addParams({
            linkId,
            toggle: watchLink ? (active ? "false" : "true") : undefined,
          });

          menu.text(
            `${status} ${active ? "Не отслеживать" : "Отслеживать"}`,
            await params.toStringAsync(),
          );

          await sendMessage(chatId, msg.text, {
            entities: msg.entities,
            reply_markup: menu,
          });
        }
      }
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

  async toggle(config: typeof trackedLinks.$inferSelect) {
    cronManagerAds.setConfig(config);
    await cronManagerAds.toggle(config.id, Boolean(config.enable));
  },

  changeCron(id: number, value: string) {
    cronManagerAds.setTime(id, value);
  },

  async delete(id: number) {
    await cronManagerAds.removeJob(id);
  },
};

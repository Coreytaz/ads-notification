
import config from "@config/config.js";
import { puppeteerConfig } from "@config/puppeteerConfig";
import logger from "@core/utils/logger.js";
import type * as typePuppeteer from "puppeteer";
import puppeteer from "puppeteer-extra";
import AnonymizeUA from "puppeteer-extra-plugin-anonymize-ua";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());
puppeteer.use(AnonymizeUA());

class Browser {
  private browser!: typePuppeteer.Browser;
  private readonly TIMEOUT: number;
  private readonly USER_AGENT = 'INSERT_USERAGENT';

  constructor(_timeout = 15000) {
    this.TIMEOUT = _timeout;
  }

  public GetBrowserInstance(): typePuppeteer.Browser {
    return this.browser;
  }

  public async CreatePage() {
    const page = await this.browser.newPage();


    await page.setExtraHTTPHeaders({
      'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7'
    });

    await page.setViewport({
      deviceScaleFactor: 1,
      hasTouch: false,
      isLandscape: false,
      isMobile: false,
      width: 0,
      height: 0
    });


    await page.setUserAgent(this.USER_AGENT);
    await page.setJavaScriptEnabled(true);
    page.setDefaultNavigationTimeout(this.TIMEOUT);

    await page.setRequestInterception(true);
    page.on('request', (req) => {
      // if (
      //   req.resourceType() == 'font'
      //   // || req.resourceType() == 'image'
      //   // || req.resourceType() == 'stylesheet'
      // ) {
      //   void req.abort();
      // }
      // else {
      void req.continue();
      // }
    });

    return page;
  }

  async Init() {
    logger.info("Puppeteer browser init. Timeout set to: " + this.TIMEOUT.toString());
    this.browser = await this.StartBrowser();

    // Listen to Disconnect event, and restart.
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.browser.on('disconnected', async () => {
      logger.info("Puppeteer browser crashed, Restarting browser.");
      await this.ReleaseBrowser();
      if (this.browser.process() != null) this.browser.process()?.kill('SIGINT');
      await this.Init();
    });
  };

  private async ReleaseBrowser() {
    logger.info("Puppeteer browser releasing and closing.");
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (this.browser) await this.browser.close();
  }

  private async StartBrowser(): Promise<typePuppeteer.Browser> {
    return await puppeteer.launch(puppeteerConfig[config.env as keyof typeof puppeteerConfig]);
  }
}

export const browser = new Browser();
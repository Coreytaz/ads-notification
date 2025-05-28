// import path from "path";
import type * as puppeteer from "puppeteer";

export const puppeteerConfig: Record<string, puppeteer.LaunchOptions> = {
  development: {
    headless: false,
    slowMo: 100,
    devtools: false,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    ignoreDefaultArgs: ["--enable-automation"],
    args: [
      '--disable-infobars',
      '--disable-gpu',
      '--no-sandbox',
      '--no-default-browser-check',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      // `--disable-extensions-except=${path.resolve('NopeCHA')}`, // Путь к папке
      // `--load-extension=${path.resolve('NopeCHA')}`,
    ]
  },
  production: {
    headless: true,
    devtools: false,
    ignoreDefaultArgs: ['--disable-infobars', "--enable-automation"],
    args: ['--disable-infobars', '--disable-gpu', '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-blink-features=AutomationControlled']
  },
};
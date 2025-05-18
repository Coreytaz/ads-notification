import config from "@config/config";
import consts from "@config/consts";
import httpContext from "express-http-context";
// @ts-expect-error
import RnR from "runtime-node-refresh";
import winston from "winston";

const { CONTEXT_KEYS } = consts;

const errorStackFormat = winston.format(info => {
  if (info instanceof Error) {
    return {
      ...info,
      stack: info.stack,
      message: info.message,
    };
  }
  return info;
});
const errorTemplate = (info: winston.Logform.TransformableInfo) => {
  const { timestamp, level, message, stack } = info as any;
  const reqId = httpContext.get(CONTEXT_KEYS.REQ_ID) as string;
  let tmpl = `${timestamp}`;
  if (reqId) tmpl += ` ${reqId}`;
  tmpl += ` ${level} ${message}`;
  if (stack) tmpl += ` \n ${stack}`;
  return tmpl;
};
const logger: winston.Logger = winston.createLogger({
  level: config.env === "development" ? "debug" : "info",
  format: winston.format.combine(
    errorStackFormat(),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
    config.env === "development"
      ? winston.format.colorize()
      : winston.format.uncolorize(),
    winston.format.splat(),
    winston.format.printf(errorTemplate),
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ["error"],
    }),
  ],
});

const avbLogLevels = [
  "error",
  "warn",
  "info",
  "http",
  "verbose",
  "debug",
  "silly",
];

let currentLogLevel: number = logger.levels[logger.level];

logger.info(`Уровень логгера установлен на ${logger.level}`);

// Refresh log level on runtime
RnR(() => {
  if (currentLogLevel < avbLogLevels.length - 1) {
    currentLogLevel += 1;
  } else {
    currentLogLevel = 0;
  }
  const found = Object.entries(logger.levels).find(
    ([, value]) => value === currentLogLevel,
  );
  if (found?.length) {
    // eslint-disable-next-line no-console
    console.log(
      `${new Date().toISOString()} system: Switch logger level from ${
        logger.level
      } to ${found[0]}`,
    );
    logger.level = found[`0`];
  }
});

export default logger;

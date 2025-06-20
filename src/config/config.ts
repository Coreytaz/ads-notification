import Joi from "joi";

// All env variables used by the app should be defined in this file.

// To define new env:
// 1. Add env variable to .env.local file;
// 2. Provide validation rules for your env in envsSchema;
// 3. Make it visible outside of this module in export section;
// 4. Access your env variable only via config file.
// Do not use process.env object outside of this file.

const envsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid("production", "development").required(),
    PORT: Joi.number().default(8080),
    TG_BOT_TOKEN: Joi.string().required(),
    DB_CONNECT: Joi.string().default("file:local.db"),
    SECRET_JWT: Joi.string().default("secret"),
  })
  .unknown(true);

const { value: envVars, error } = envsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(
    `Config validation error: ${error.message}. \n
     This app requires env variables to work properly. If you run app locally use docker-compose`,
  );
}

// map env vars and make it visible outside module
export default {
  isDev: envVars.NODE_ENV === "development",
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  tgBotToken: envVars.TG_BOT_TOKEN,
  dbConnect: envVars.DB_CONNECT,
  secretJWT: envVars.SECRET_JWT,
};

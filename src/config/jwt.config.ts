import { SignOptions, VerifyOptions } from "jsonwebtoken";

import config from "./config.js";

export const jwtConfig = (jwtConfigParams: SignOptions | VerifyOptions) => {
  return [config.secretJWT, jwtConfigParams];
};

import { jwtConfig } from "@config/jwt.config";
import jwt, {
  Jwt,
  PrivateKey,
  PublicKey,
  Secret,
  SignOptions,
  VerifyOptions,
} from "jsonwebtoken";

const sign = (
  payload: string | Buffer | object,
  options?: SignOptions & { algorithm: "none" },
  secretOrPrivateKey?: Secret | PrivateKey,
): string => {
  const [secret, verifyOptions] = jwtConfig(options ?? {});
  return jwt.sign(payload, secret ?? secretOrPrivateKey, verifyOptions);
};

const verify = (
  token: string,
  options?: VerifyOptions,
  secretOrPublicKey?: Secret | PublicKey,
): Jwt => {
  const [secret, verifyOptions] = jwtConfig(options ?? {});
  return jwt.verify(token, secretOrPublicKey ?? secret, verifyOptions);
};

export default { ...jwt, verify, sign };

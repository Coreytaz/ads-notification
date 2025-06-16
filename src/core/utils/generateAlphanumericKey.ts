import crypto from "crypto";

export function generateAlphanumericKey(length = 32) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "";
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    const index = randomBytes[i] % chars.length;
    key += chars[index];
  }
  return key;
}

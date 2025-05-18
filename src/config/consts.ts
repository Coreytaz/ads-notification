import path from "node:path";
import { fileURLToPath } from "node:url";

const _filename = fileURLToPath(import.meta.url);
const DIRNAME = path.dirname(_filename);

const PUBLIC_FOLDER = path.join(DIRNAME, "../..", "public");
const API_ROOT_PATH_V1 = "/api";

const CONTEXT_KEYS = {
  REQ_ID: "reqId",
};

export default {
  API_ROOT_PATH_V1,
  PUBLIC_FOLDER,
  CONTEXT_KEYS,
  DIRNAME,
};

import type { Command } from "@grammyjs/commands";

import { idCommand } from "./id.command.js";
import { startCommand } from "./start.command.js";

export default {
  "/id": idCommand,
  "/start": startCommand,
} as unknown as Record<string, Command>;

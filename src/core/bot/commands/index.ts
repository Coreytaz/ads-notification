import type { Command } from "@grammyjs/commands";

import { idCommand } from "./id.command.js";
import { menuCommand } from "./menu.command.js";
import { startCommand } from "./start.command.js";

export default {
  "/id": idCommand,
  "/start": startCommand,
  "/menu": menuCommand,
} as unknown as Record<string, Command>;

import type { Command } from "@grammyjs/commands";

import { idCommand } from "./id.command.js";
import { menuCommand } from "./menu.command.js";
import { resetCommand } from "./reset.command.js";
import { startCommand } from "./start.command.js";

export default {
  "/id": idCommand,
  "/start": startCommand,
  "/menu": menuCommand,
  "/reset": resetCommand,
} as unknown as Record<string, Command>;

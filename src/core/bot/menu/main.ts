import { InlineKeyboard } from "grammy";

import { Context } from "../core/interface/Context";
import { menuButton } from "./menuButton.config";

export const mainMenu = (ctx: Context) => {
  const mainMenu = new InlineKeyboard();

  Object.values(menuButton.main).forEach(
    ({
      data,
      label,
      role = [],
    }: {
      data: string;
      label: string;
      role?: string[];
    }) => {
      if (role.length === 0) {
        mainMenu.text(label, data).row();
        return;
      }

      if (role.includes(ctx.role.name.toLocaleLowerCase())) {
        mainMenu.text(label, data).row();
      }
    },
  );

  return mainMenu;
};

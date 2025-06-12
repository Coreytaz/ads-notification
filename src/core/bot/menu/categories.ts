import { InlineKeyboard } from "grammy";

import { Context } from "../core/interface/Context";
import { menuButton } from "./menuButton.config";

export const categoriesMenu = (ctx: Context) => {
  const mainMenu = new InlineKeyboard();

  Object.values(menuButton.categories).forEach(
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

      if (role.includes(ctx.role.name)) {
        mainMenu.text(label, data).row();
      }
    },
  );

  return mainMenu;
};

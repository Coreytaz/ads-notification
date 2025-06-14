import { InlineKeyboard } from "grammy";

import { Context } from "../core/interface/Context";
import { menuButton } from "./menuButton.config";

export const systemMenu = (ctx: Context) => {
  const systemMenu = new InlineKeyboard();
  Object.values(menuButton.system).forEach(
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
        systemMenu.text(label, data).row();
        return;
      }

      if (role.includes(ctx.role.name)) {
        systemMenu.text(label, data).row();
      }
    },
  );

  return systemMenu;
};

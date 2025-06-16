import { ParamsExtractorDB } from "@core/bot/core/utils/paramsExractorDB";
import { menuButton } from "@core/bot/menu/menuButton.config";
import { getLinkByIds } from "@core/db/models";
import { Request, Response } from "express";
import { InlineKeyboard } from "grammy";
import { StatusCodes } from "http-status-codes";

import { messageNotification, sendMessage } from "./notification.service";

const notificationDemo = async (req: Request, res: Response) => {
  const links = await getLinkByIds([61]);

  const link = links[0];

  const msg = messageNotification(
    {
      title: "test",
      id: 0,
      enable: 0,
      url: "",
      cronTime: "",
      chatId: "",
      created_at: "",
      updated_at: "",
    },
    link,
  );

  const menu = new InlineKeyboard();

  const params = new ParamsExtractorDB(menuButton.watchLink.toggle.data);
  params.addParam("linkId", link.id);

  menu.text("🔔 Отслеживать", await params.toStringAsync());

  await sendMessage(1221893505, msg.text, {
    entities: msg.entities,
    reply_markup: menu,
  });

  res.status(StatusCodes.OK);
  res.json({
    status: "demo notification send",
    link: links[0],
    date: new Date().toJSON(),
  });
};

export default notificationDemo;

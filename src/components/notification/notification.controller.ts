// import { bot } from "@core/bot/core";
// import { getLinkByIds } from "@core/db/models";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

// import { messageNotification } from "./notification.service";

const notificationDemo = (req: Request, res: Response) => {
  // const links = await getLinkByIds([1]);

  // const link = links[0];

  // const msg = messageNotification(link);

  // await bot.api.sendMessage(1221893505, msg.text, {
  //   entities: msg.entities,
  // });

  res.status(StatusCodes.OK);
  res.json({
    status: "demo notification send",
    // link: links[0],
    date: new Date().toJSON(),
  });
};

export default notificationDemo;

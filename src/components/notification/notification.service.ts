import { bot } from "@core/bot/core";
import { Context } from "@core/bot/core/interface/Context";
import {
  createOneChatReply,
  findOneChatReply,
  link as linkDB,
  trackedLinks,
  updateOneChatReply,
} from "@core/db/models";
import { isEmpty } from "@core/utils/isEmpty";
import { bold, fmt, link as fmtLink } from "@grammyjs/parse-mode";
import { DateTime } from "luxon";

const messageNotification = (
  config: typeof trackedLinks.$inferSelect,
  link: typeof linkDB.$inferSelect,
) => {
  const msg = fmt`По вашему запросу${config.title ? ` "${config.title}" ` : " "}найдено новое объявление

${link.title ? fmt`🏠 ${bold(link.title)}, ` : ""}${link.square ? fmt`${bold(link.square)}` : ""}
${
  link.price
    ? fmt`💵 ${Number(link.price).toLocaleString("ru-RU", {
        style: "currency",
        currency: "RUB",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`
    : ""
}
${link.address ? fmt`🌎 Ул. ${link.address}, ` : ""}${link.house ? fmt`дом ${link.house}` : ""}
${link.seller_name ? fmt`👤 Продавец - ${bold(link.seller_name)}` : ""}
${link.floor && link.floor_count ? fmt`🪜 Этаж - ${bold(link.floor + " / " + link.floor_count)}` : ""}
${link.small_description ? fmt`\n${link.small_description.length > 255 ? link.small_description.slice(0, 255) + "..." : link.small_description}` : ""}

⌚️${
    link.date_published
      ? fmt`Добавлено ${DateTime.fromSQL(link.date_published, {
          setZone: true,
        }).toLocaleString({
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })} по МСК`
      : ""
  }
${link.url ? fmt`🔗${fmtLink("Ссылка на объявление", link.url)}` : ""}
  `;

  return msg;
};

const create = async (chatId: string, messageId: number) => {
  let reply = await findOneChatReply({
    chatId: chatId,
    messageId,
  });

  if (!isEmpty(reply)) {
    reply = await updateOneChatReply(
      {
        chatId: chatId,
        messageId: messageId,
      },
      {
        messageId: messageId,
      },
    );
    return reply;
  }

  reply = await createOneChatReply({
    chatId: chatId,
    messageId: messageId,
  });

  return reply;
};

const sendMessage: Context["api"]["sendMessage"] = async (
  chat_id,
  text,
  other,
) => {
  const msg = await bot.api.sendMessage(chat_id, text, other);
  await create(String(chat_id), msg.message_id);
  return msg;
};

export { messageNotification, sendMessage };

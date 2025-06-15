import { link as linkDB, trackedLinks } from "@core/db/models";
import { bold, fmt, link as fmtLink } from "@grammyjs/parse-mode";

const messageNotification = (
  config: typeof trackedLinks.$inferSelect,
  link: typeof linkDB.$inferSelect,
) => {
  const msg = fmt`По вашей категории${config.title ? ` "${config.title}" ` : " "}найдено новое объявление ${link.title ? fmt`${bold(link.title)}, ` : ""}${link.square ? fmt`${bold(link.square)}` : ""}
${
  link.price
    ? fmt`💵 ${Number(link.price).toLocaleString("ru-RU", {
        style: "currency",
        currency: "RUB",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : ""
}
🌎${link.address ? fmt` ул. ${link.address}, ` : ""}${link.house ? fmt`дом ${link.house}` : ""}
👤${link.seller_name ? fmt` Продавец ${link.seller_name}` : ""}
🪜${link.floor && link.floor_count ? fmt` Этаж ${bold(link.floor + " / " + link.floor_count)}` : ""}

${link.small_description ? fmt`${link.small_description.length > 255 ? link.small_description.slice(0, 255) + "..." : link.small_description}` : ""}

⌚️${
    link.created_at
      ? fmt`Добавлено ${new Date(link.created_at).toLocaleDateString("ru-RU", {
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

export { messageNotification };

import { DateTime } from "luxon";

const mskZone = "Europe/Moscow";

export function parseRussianDate(dateStr: string) {
  const now = DateTime.now().setZone(mskZone);
  const months = {
    янв: 1,
    фев: 2,
    мар: 3,
    апр: 4,
    май: 5,
    июн: 6,
    июл: 7,
    авг: 8,
    сен: 9,
    окт: 10,
    ноя: 11,
    дек: 12,
  };

  if (dateStr.startsWith("сегодня")) {
    const timePart = dateStr.split(", ")[1];
    const [hours, minutes] = timePart.split(":").map(Number);
    return DateTime.fromObject(
      {
        year: now.year,
        month: now.month,
        day: now.day,
        hour: hours,
        minute: minutes,
      },
      { zone: mskZone },
    );
  } else if (dateStr.startsWith("вчера")) {
    const timePart = dateStr.split(", ")[1];
    const [hours, minutes] = timePart.split(":").map(Number);
    return DateTime.fromObject(
      {
        year: now.year,
        month: now.month,
        day: now.day - 1,
        hour: hours,
        minute: minutes,
      },
      { zone: mskZone },
    );
  } else {
    // Обрабатываем формат "20 май, 17:41"
    const [datePart, timePart] = dateStr.split(", ");
    const [day, monthRu] = datePart.split(" ");
    const month = months[monthRu.toLowerCase() as keyof typeof months];
    const [hours, minutes] = timePart.split(":").map(Number);

    return DateTime.fromObject(
      {
        year: now.year,
        month,
        day: parseInt(day),
        hour: hours,
        minute: minutes,
      },
      { zone: mskZone },
    );
  }
}

export function compareDates(date: string, dateFromDB: string) {
  try {
    const date1 = parseRussianDate(date);
    const date2 = DateTime.fromSQL(dateFromDB, { zone: "UTC" }).setZone(mskZone);

    return date1 > date2;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Ошибка при парсинге даты:", e);
    return false;
  }
}

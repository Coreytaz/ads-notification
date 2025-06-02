/**
 * Проверяет, является ли строка номером дома.
 * @param {string} str - Входная строка для проверки.
 * @returns {boolean} - Возвращает true, если строка похожа на номер дома, иначе false.
 */
export function isHouseNumber(str: string | null): boolean {
  if (str === null) {
    return false;
  }

  const trimmedStr = str.trim();

  // Если строка пустая или слишком длинная (скорее всего, это не номер дома)
  if (trimmedStr.length === 0 || trimmedStr.length > 15) {
    return false;
  }

  // Регулярное выражение: должна быть хотя бы одна цифра или дробь/дефис
  const hasNumberOrSpecialChar = /[\d\/\-]/.test(trimmedStr);

  // Регулярное выражение для допустимых символов
  const isValidFormat = /^[\d\s\/\-\.\u0400-\u04FFa-zA-Z]+$/u.test(trimmedStr);

  return hasNumberOrSpecialChar && isValidFormat;
}

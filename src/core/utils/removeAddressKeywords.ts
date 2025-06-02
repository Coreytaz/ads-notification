interface ReplacementPattern {
  regex: RegExp;
  replace: string;
}

/**
 * Удаляет ключевые слова адресов (ул., жк и др.) из строки
 * @param text - Исходный текст
 * @param patterns - Опциональные пользовательские regex-шаблоны
 * @returns Очищенный текст
 */
export function removeAddressKeywords(
  text: string,
  patterns?: ReplacementPattern[],
): string {
  if (!patterns && !Array.isArray(patterns)) return text;

  const _patterns: ReplacementPattern[] = patterns;
  let cleanedText: string = text;

  for (const pattern of _patterns) {
    cleanedText = cleanedText.replace(pattern.regex, pattern.replace);
  }

  // Чистка лишних пробелов и запятых
  return cleanedText
    .replace(/\s{2,}/g, " ")
    .replace(/,\s*,/g, ",")
    .trim();
}

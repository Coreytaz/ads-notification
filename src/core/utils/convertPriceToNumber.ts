export function convertPriceToNumber(price: string | null): string | null {
  if (!price) return null;

  const priceNumber = price
    .replace(/\s/g, "")
    .replace(/,/g, "")
    .replace(/[^0-9.]/g, "");

  return priceNumber;
}
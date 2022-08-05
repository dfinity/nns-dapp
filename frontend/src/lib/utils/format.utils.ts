/**
 * Default format: 123456.789 -> "123'456.79"
 */
export const formatNumber = (
  value: number,
  options?: { minFraction: number; maxFraction: number }
): string => {
  const { minFraction = 2, maxFraction = 2 } = options || {};

  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: minFraction,
    maximumFractionDigits: maxFraction,
  })
    .format(value)
    .replace(/\s/g, "’")
    .replace(",", ".");
};

/**
 * Default format: 0.150123 -> "15.012%"
 */
export const formatPercentage = (
  value: number,
  options?: { minFraction: number; maxFraction: number }
) => {
  const { minFraction = 3, maxFraction = 3 } = options || {};
  return `${formatNumber(value * 100, { minFraction, maxFraction })}%`;
};

/**
 * Shortens the text from the middle. Ex: "12345678901234567890" -> "1234567...5678901"
 * @param text
 * @returns text
 */
export const shortenWithMiddleEllipsis = (text: string): string =>
  text.length > 16 ? `${text.slice(0, 7)}...${text.slice(-7)}` : text;

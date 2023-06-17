import { nonNullish } from "@dfinity/utils";

/**
 * Default format: 123456.789 -> "123'456.79"
 */
export const formatNumber = (
  value: number,
  options?: {
    minFraction: number;
    maxFraction: number;
    maximumSignificantDigits?: number;
  }
): string => {
  const {
    minFraction = 2,
    maxFraction = 2,
    maximumSignificantDigits,
  } = options || {};

  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: minFraction,
    maximumFractionDigits: maxFraction,
    ...(nonNullish(maximumSignificantDigits) && { maximumSignificantDigits }),
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
 * @param splitLength An optional length for the split. e.g. 12345678 becomes, if splitLength = 2, 12...78
 * @returns text
 */
export const shortenWithMiddleEllipsis = (
  text: string,
  splitLength = 7
): string => {
  // Original min length was 16 to extract 7 split
  const minLength = splitLength * 2 + 2;
  return text.length > minLength
    ? `${text.slice(0, splitLength)}...${text.slice(-1 * splitLength)}`
    : text;
};

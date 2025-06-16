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
 * Formats a number according to the following rules:
 * - X < 1'000: Display 2 decimal points (e.g., $420.69)
 * - 1'000 ≤ X < 1'000'000: Display whole number with 0 decimal points (e.g., $1'996)
 * - 1'000'000 ≤ X < 1'000'000'000: Display millions with "M" and 2 decimal points (e.g., $1.50M)
 * - 1'000'000'000 ≤ X: Display billions with "B" and 2 decimal points (e.g., $1.50B)
 */
export const formatCurrencyNumber = (value: number): string => {
  // For values less than 1'000
  if (value < 1_000) {
    return `${formatNumber(value, { minFraction: 2, maxFraction: 2 })}`;
  }

  // For values between 1'000 and 1'000'000
  if (value < 1_000_000) {
    return `${formatNumber(value, { minFraction: 0, maxFraction: 0 })}`;
  }

  // For values between 1'000'000 and 1'000'000'000
  if (value < 1_000_000_000) {
    const millions = value / 1_000_000;
    return `${formatNumber(millions, { minFraction: 2, maxFraction: 2 })}M`;
  }

  // For values greater than or equal to 1'000'000'000
  const billions = value / 1_000_000_000;
  return `${formatNumber(billions, { minFraction: 2, maxFraction: 2 })}B`;
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

export const renderPrivacyModeBalance = (count: number) =>
  "•".repeat(Math.max(0, count));

export const formatUsdValue = (usdValue: number): string =>
  usdValue > 0 && usdValue < 0.01 ? "< $0.01" : `$${formatNumber(usdValue)}`;

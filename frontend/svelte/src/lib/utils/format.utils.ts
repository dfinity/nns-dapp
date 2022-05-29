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

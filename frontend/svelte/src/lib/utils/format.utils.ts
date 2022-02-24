/**
 * Default format: 123456.789 -> "123'456.79"
 */
export const formatNumber = (
  value: number | bigint,
  options?: { minFraction: number; maxFraction: number }
): string => {
  const { minFraction = 2, maxFraction = 2 } = options || {};
  console.log(minFraction, maxFraction);

  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: minFraction,
    maximumFractionDigits: maxFraction,
  })
    .format(value)
    .replace(/\s/g, "’")
    .replace(",", ".");
};

export const E8S_PER_ICP = 100000000;
export const TRANSACTION_FEE_E8S = 10000;

/*
 * The format should be:
 * a “.” separating full ICP from fractional part
 * “ “ as a “thousands” separator in the “full” part
 * in the fractional part, show at least two digits (like “10.00” or “11.30”), otherwise cut trailing zeroes
 * Examples:
 *   10.00
 *   10.01
 *   10.10
 *   10.123
 *   20.00
 *   200.00
 *   2 000.00
 *   20 000.00
 */

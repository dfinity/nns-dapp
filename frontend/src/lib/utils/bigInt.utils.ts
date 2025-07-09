// // Returns the result of dividing a bigint by another bigint with specified precision
export const bigIntDiv = (
  a: bigint,
  b: bigint,
  precision: number = 2
): number => {
  return Number((a * 10n ** BigInt(precision)) / b) / 10 ** precision;
};

// Returns the result of multiplying a bigint by a number with specified precision
export const bigIntMul = (
  a: bigint,
  b: number,
  precision: number = 2
): bigint => {
  return (
    (a * BigInt(Math.round(b * 10 ** precision))) / BigInt(10 ** precision)
  );
};

// Returns the max bigint from the provided arguments
export const bigIntMax = (...args: bigint[]) =>
  args.reduce((m, e) => (e > m ? e : m));

// Returns the min bigint from the provided arguments
export const bigIntMin = (...args: bigint[]) =>
  args.reduce((m, e) => (e < m ? e : m));

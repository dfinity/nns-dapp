// These utils are duplicated in nns-js and sns-js, we might want to create a utility lib someday
// We do not expose the utility in these libraries for that reason

export class NullishError extends Error {}

export const assertNonNullish: <T>(
  value: T,
  message?: string
) => asserts value is NonNullable<T> = <T>(
  value: T,
  message?: string
): void => {
  if (value === null || value === undefined) {
    throw new NullishError(message);
  }
};

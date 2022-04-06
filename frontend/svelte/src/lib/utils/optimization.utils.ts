/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Uses JSON.stringify to generate hashes
 */
type MemoizedFn<T> = (...args: any[]) => T;
export const memoize = <ResultType>(
  fn: MemoizedFn<ResultType>
): ((...args: any[]) => ResultType) => {
  const cache = {};
  return (...args) => {
    const key = JSON.stringify(args);
    /* eslint-disable-next-line no-prototype-builtins */
    if (!cache.hasOwnProperty(key)) {
      cache[key] = fn(...args);
    }
    return cache[key];
  };
};

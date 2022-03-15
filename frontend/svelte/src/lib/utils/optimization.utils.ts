/**
 * Uses JSON.stringify to generate hashes
 */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const memoize = <ResultType>(fn): ((...args: any[]) => ResultType) => {
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

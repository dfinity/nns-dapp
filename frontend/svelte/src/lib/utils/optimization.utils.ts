/**
 * Uses JSON.stringify to generate hashes
 */
export const memoize = <ResultType>(fn): ((...args: any[]) => ResultType) => {
  const cache = {};
  return (...args) => {
    const key = JSON.stringify(args);
    if (!cache.hasOwnProperty(key)) {
      cache[key] = fn(...args);
    }
    return cache[key];
  };
};

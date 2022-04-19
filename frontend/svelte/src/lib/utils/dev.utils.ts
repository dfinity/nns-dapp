export const isNode = (): boolean =>
  typeof process !== "undefined" &&
  process.versions != null &&
  process.versions.node != null;

/**
 *
 * console.log with time prefix (e.g. "[15:22:55.438] message text")
 */
export const logWithTimestamp = (...args): void => {
  const time = `[${new Date().toISOString().split("T")[1].replace("Z", "")}]`;
  console.log.call(console, ...[time, ...args]);
};

// Insecure but fast
// https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0
const seed = Math.round(Math.random() * 99999);
export const hashCode = (value: string | bigint | number): string =>
  (
    Array.from(`${value}`).reduce(
      (s, c) => (Math.imul(31, s) + c.charCodeAt(0)) | 0,
      0
    ) + seed
  )
    .toString(36)
    .toUpperCase();

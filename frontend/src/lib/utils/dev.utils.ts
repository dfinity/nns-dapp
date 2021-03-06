export const isNode = (): boolean =>
  typeof process !== "undefined" &&
  process.versions != null &&
  process.versions.node != null;

/**
 *
 * console.log with time prefix (e.g. "[15:22:55.438] message text")
 */
export const logWithTimestamp = (...args: string[]): void => {
  if (isNode() === true) return;

  const time = `[${new Date().toISOString().split("T")[1].replace("Z", "")}]`;
  console.log.call(console, ...[time, ...args]);
};

// Insecure but fast
// https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0
const seed = Math.round(Math.random() * 1e6);
export const hashCode = (value: string | bigint | number): string =>
  (
    Array.from(`${value}`).reduce(
      (s, c) => (Math.imul(31, s) + c.charCodeAt(0)) | 0,
      0
    ) + seed
  )
    .toString(36)
    .toUpperCase();

// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
export const digestText = async (text: string): Promise<string> => {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  // convert buffer to byte array
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // convert bytes to hex string
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
};

// TODO: to be deleted - use for mock data only
export const shuffle = <T>(items: T[]): T[] =>
  items
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

export const isNode = (): boolean =>
  typeof process !== "undefined" &&
  process.versions != null &&
  process.versions.node != null;

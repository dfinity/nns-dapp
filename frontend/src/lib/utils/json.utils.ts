import { isHash, isLikeANumber, isPrincipal } from "$lib/utils/utils";

export type TreeJsonValueType =
  | "bigint"
  | "boolean"
  | "function"
  | "null"
  | "number"
  | "object"
  | "principal"
  | "hash"
  | "string"
  | "symbol"
  | "base64Encoding"
  | "undefined"
  // units-only nodes
  // sample: { "seconds": 1000000000 }
  | "seconds"
  // sample: { "e8s": 1000000000 }
  | "e8s"
  // sample: { "basisPoints": 1000000000 }
  | "basisPoints";

/**
 * Returns the type of the value for the TreeJson&TreeJsonValue components.
 * @param value tree node value
 */
export const getTreeJsonValueRenderType = (
  value: unknown
): TreeJsonValueType => {
  if (value === null) return "null";
  if (isPrincipal(value)) return "principal";
  if (Array.isArray(value) && isHash(value)) return "hash";
  // not null was already checked above
  if (typeof value === "object") {
    const keys = Object.keys(value);

    if (Object.keys(value as object)[0] === "base64Encoding") {
      return "base64Encoding";
    }

    // check for unit-only nodes (e.g. { "e8s": 1000000000 })
    if (keys.length === 1) {
      const key = keys[0];
      const keyValue = (value as Record<string, unknown>)[key];
      console.log(key, keyValue);
      if (
        ["e8s", "seconds", "basisPoints"].includes(key) &&
        isLikeANumber(keyValue)
      ) {
        return key as TreeJsonValueType;
      }
    }
  }
  return typeof value;
};

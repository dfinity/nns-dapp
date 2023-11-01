import { isHash, isPrincipal } from "$lib/utils/utils";

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
  | "undefined";

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
  if (
    typeof value === "object" &&
    Object.keys(value as object)[0] === "base64Encoding"
  )
    return "base64Encoding";
  return typeof value;
};

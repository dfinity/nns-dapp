import { isHash, isPrincipal } from "$lib/utils/utils";

export type PrettyJsonValueType =
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

export const getPrettyJsonValueType = (value: unknown): PrettyJsonValueType => {
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

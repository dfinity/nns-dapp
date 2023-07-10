import { Principal } from "@dfinity/principal";
import { nonNullish } from "@dfinity/utils";

const JSON_KEY_BIGINT = "__bigint__";
const JSON_KEY_PRINCIPAL = "__principal__";
const JSON_KEY_UINT8ARRAY = "__uint8array__";

export const jsonReplacer = (_key: string, value: unknown): unknown => {
  if (typeof value === "bigint") {
    return { [JSON_KEY_BIGINT]: `${value}` };
  }

  if (nonNullish(value) && value instanceof Principal) {
    return { [JSON_KEY_PRINCIPAL]: value.toText() };
  }

  if (nonNullish(value) && value instanceof Uint8Array) {
    return { [JSON_KEY_UINT8ARRAY]: Array.from(value) };
  }

  return value;
};

export const jsonReviver = (_key: string, value: unknown): unknown => {
  const mapValue = <T>(key: string): T => (value as Record<string, T>)[key];

  if (
    nonNullish(value) &&
    typeof value === "object" &&
    JSON_KEY_BIGINT in value
  ) {
    return BigInt(mapValue(JSON_KEY_BIGINT));
  }

  if (
    nonNullish(value) &&
    typeof value === "object" &&
    JSON_KEY_PRINCIPAL in value
  ) {
    return Principal.fromText(mapValue(JSON_KEY_PRINCIPAL));
  }

  if (
    nonNullish(value) &&
    typeof value === "object" &&
    JSON_KEY_UINT8ARRAY in value
  ) {
    return Uint8Array.from(mapValue(JSON_KEY_UINT8ARRAY));
  }

  return value;
};

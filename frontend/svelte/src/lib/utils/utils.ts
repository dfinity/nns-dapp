import type { Principal } from "@dfinity/principal";

/* eslint-disable-next-line @typescript-eslint/ban-types */
export const debounce = (func: Function, timeout?: number) => {
  let timer: NodeJS.Timer | undefined;

  return (...args: unknown[]) => {
    const next = () => func(...args);

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(
      next,
      timeout !== undefined && timeout > 0 ? timeout : 300
    );
  };
};

export const isPrincipal = (value: unknown): value is Principal =>
  typeof value === "object" && (value as Principal)?._isPrincipal === true;

/**
 * Transform bigint to string to avoid serialization error.
 * devMode transforms 123n -> "BigInt(123)"
 */
export const stringifyJson = (
  value: unknown,
  options?: {
    indentation?: number;
    devMode?: boolean;
  }
): string =>
  JSON.stringify(
    value,
    (_, value) => {
      switch (typeof value) {
        case "function":
          return "f () { ... }";
        case "symbol":
          return value.toString();
        case "object": {
          // Represent Principals as strings rather than as byte arrays when serializing to JSON strings
          if (isPrincipal(value)) {
            const asText = value.toString();
            // To not stringify NOT Principal instance that contains _isPrincipal field
            return asText === "[object Object]" ? value : asText;
          }

          if (value instanceof Promise) {
            return "Promise(...)";
          }

          break;
        }
        case "bigint": {
          if (options?.devMode !== undefined && options.devMode) {
            return `BigInt('${value.toString()}')`;
          }
          return value.toString();
        }
      }
      return value;
    },
    options?.indentation ?? 0
  );

/**
 * Returns only uniq elements of the list (uses JSON.stringify for comparation)
 */
export const uniqueObjects = <T>(list: T[]): T[] => {
  const uniqHashes = new Set<string>();
  const result: T[] = [];
  for (const item of list) {
    const hash = stringifyJson(item);
    if (!uniqHashes.has(hash)) {
      uniqHashes.add(hash);
      result.push(item);
    }
  }
  return result;
};

// https://stackoverflow.com/questions/43010737/way-to-tell-typescript-compiler-array-prototype-filter-removes-certain-types-fro#answer-54318054
export const isDefined = <T>(argument: T | undefined): argument is T =>
  argument !== undefined;

export const targetBlankLinkRenderer = (
  href: string | null,
  title: string | null,
  text: string
): string =>
  `<a${
    href === null
      ? ""
      : ` target="_blank" rel="noopener noreferrer" href="${href}"`
  }${title === null ? "" : ` title="${title}"`}>${text}</a>`;

/**
 * Returns an array of arrays of size <= `chunkSize`
 */
export const createChunks = <T>(
  elements: Array<T>,
  chunkSize = 10
): Array<Array<T>> => {
  const chunks: Array<Array<T>> = [];
  for (let i = 0; i < elements.length; i += chunkSize) {
    const chunk = elements.slice(i, i + chunkSize);
    chunks.push(chunk);
  }
  return chunks;
};

// e.g. payloads.did/state_hash
export const isHash = (bytes: number[]): boolean =>
  bytes.length === 32 &&
  bytes.find(
    (value) => !Number.isInteger(value) || value < 0 || value > 255
  ) === undefined;

// Convert a byte array to a hex string
export const bytesToHexString = (bytes: number[]): string =>
  bytes.reduce(
    (str, byte) => `${str}${byte.toString(16).padStart(2, "0")}`,
    ""
  );

export const isNullOrUndefined = (value: unknown): boolean =>
  value === undefined || value === null;

export const mapPromises = async <T, R>(
  items: Array<T> | undefined,
  fun: (args: T) => Promise<R>
): Promise<Array<R> | undefined> => {
  if (items === undefined) {
    return undefined;
  }

  return Promise.all(items.map(async (item) => await fun(item)));
};

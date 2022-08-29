import type { Principal } from "@dfinity/principal";
import { errorToString } from "./error.utils";

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

          if (value instanceof ArrayBuffer) {
            return new Uint8Array(value).toString();
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

// Convert a hex string to a byte array
// Source: https://stackoverflow.com/a/34356351
export const hexStringToBytes = (hexString: string): number[] => {
  const bytes: number[] = [];
  // Loop through each pair of hex digits
  for (let c = 0; c < hexString.length; c += 2) {
    const hexDigit = hexString.substring(c, c + 2);
    // Parse a base 16
    const byte = parseInt(hexDigit, 16);
    bytes.push(byte);
  }
  return bytes;
};

/** Is null or undefined */
export const isNullish = <T>(
  argument: T | undefined | null
): argument is undefined | null => argument === null || argument === undefined;

/** Not null and not undefined */
export const nonNullish = <T>(
  argument: T | undefined | null
): argument is NonNullable<T> => !isNullish(argument);

export const mapPromises = async <T, R>(
  items: Array<T> | undefined,
  fun: (args: T) => Promise<R>
): Promise<Array<R> | undefined> => {
  if (items === undefined) {
    return undefined;
  }

  return Promise.all(items.map(async (item) => await fun(item)));
};

export const isArrayEmpty = <T>({ length }: T[]): boolean => length === 0;

const AMOUNT_VERSION_PARTS = 3;
const addZeros = (nums: number[], amountZeros: number): number[] =>
  amountZeros > nums.length
    ? [...nums, ...[...Array(amountZeros - nums.length).keys()].map(() => 0)]
    : nums;
/**
 * Returns true if the current version is smaller than the minVersion, false if equal or bigger.
 *
 * @param {Object} params
 * @param {string} params.minVersion Ex: "1.0.0"
 * @param {string} params.currentVersion Ex: "2.0.0"
 * @returns boolean
 */
export const smallerVersion = ({
  minVersion,
  currentVersion,
}: {
  minVersion: string;
  currentVersion: string;
}): boolean => {
  const minVersionStandarized = addZeros(
    minVersion.split(".").map(Number),
    AMOUNT_VERSION_PARTS
  ).join(".");
  const currentVersionStandarized = addZeros(
    currentVersion.split(".").map(Number),
    AMOUNT_VERSION_PARTS
  ).join(".");
  // Versions need to have the same number of parts to be comparable
  // Source: https://stackoverflow.com/a/65687141
  return (
    currentVersionStandarized.localeCompare(minVersionStandarized, undefined, {
      numeric: true,
      sensitivity: "base",
    }) < 0
  );
};

export const waitForMilliseconds = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

export class PollingLimitExceededError extends Error {}
const DEFAUL_MAX_POLLING_ATTEMPTS = 10;
/**
 * Function that polls a specific function, checking error with passed argument to recall or not.
 *
 * @param {Object} params
 * @param {fn} params.fn Function to call
 * @param {shouldExit} params.shouldExit Function to check whether function should stop polling when it throws an error
 * @param {maxAttempts} params.maxAttempts Param to override the default number of times to poll.
 * @param {counter} params.counter Param to check how many times it has polled.
 *
 * @returns
 */
export const poll = async <T>({
  fn,
  shouldExit,
  maxAttempts = DEFAUL_MAX_POLLING_ATTEMPTS,
  counter = 0,
}: {
  fn: () => Promise<T>;
  shouldExit: (err: Error) => boolean;
  maxAttempts?: number;
  counter?: number;
}): Promise<T> => {
  if (counter >= maxAttempts) {
    throw new PollingLimitExceededError();
  }
  try {
    return await fn();
  } catch (error) {
    if (shouldExit(error)) {
      throw error;
    }
    // Log swallowed errors
    console.error(`Error polling: ${errorToString(error)}`);
  }
  await waitForMilliseconds(500);
  return poll({
    fn,
    shouldExit,
    maxAttempts,
    counter: counter + 1,
  });
};

/**
 * Use to highlight a placeholder in a text rendered from i18n labels.
 * TODO: can maybe be replaced with a more meaningful semantic such as <mark></mark>
 */
export const valueSpan = (text: string): string =>
  `<span class="value">${text}</span>`;

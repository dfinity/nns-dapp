import { toastsError, toastsHide } from "$lib/stores/toasts.store";
import type { PngDataUrl } from "$lib/types/assets";
import type { Principal } from "@dfinity/principal";
import { nonNullish } from "@dfinity/utils";
import { errorToString } from "./error.utils";

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

          // optimistic hash stringifying
          if (Array.isArray(value) && isHash(value)) {
            return bytesToHexString(value);
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

export class PollingCancelledError extends Error {
  public id: symbol;
  constructor(id: symbol) {
    super(`Polling cancelled, id: ${String(id)}`);
    this.id = id;
  }
}

// Exported for testing purposes
export const DEFAULT_MAX_POLLING_ATTEMPTS = 10;
const DEFAULT_WAIT_TIME_MS = 500;

// Map symbol to `reject` function
const currentPolls = new Map<symbol, (error: PollingCancelledError) => void>();

export const cancelPoll = (id: symbol) => {
  if (currentPolls.has(id)) {
    // Call reject function to stop polling
    const reject = currentPolls.get(id);
    // TS doesn't know that `reject` is defined here
    reject?.(new PollingCancelledError(id));
  }
};

/**
 * Function that polls a specific function, checking error with passed argument to recall or not.
 *
 * @param {Object} params
 * @param {fn} params.fn Function to call
 * @param {shouldExit} params.shouldExit Function to check whether function should stop polling when it throws an error
 * @param {maxAttempts} params.maxAttempts Param to override the default number of times to poll.
 * @param {millisecondsToWait} params.millisecondsToWait How long to wait between calls, or the base for the exponential backoff if that's enabled
 * @param {useExponentialBackoff} params.useExponentialBackoff Whether to use exponential backoff instead of waiting the same time between retries
 * @param {failuresBeforeHighLoadMessage} params.failuresBeforeHighLoadMessage Show the "high load" message after this many failures.
 *
 * @returns
 */
export const poll = async <T>({
  fn,
  shouldExit,
  maxAttempts = DEFAULT_MAX_POLLING_ATTEMPTS,
  millisecondsToWait = DEFAULT_WAIT_TIME_MS,
  useExponentialBackoff = false,
  failuresBeforeHighLoadMessage = 6,
  pollId,
}: {
  fn: () => Promise<T>;
  shouldExit: (err: unknown) => boolean;
  maxAttempts?: number;
  millisecondsToWait?: number;
  useExponentialBackoff?: boolean;
  failuresBeforeHighLoadMessage?: number;
  pollId?: symbol;
}): Promise<T> => {
  let highLoadToast: symbol | null = null;
  // If we are already polling for this id, don't poll twice.
  if (nonNullish(pollId) && currentPolls.has(pollId)) {
    throw new PollingCancelledError(pollId);
  }
  // We'll never call `resolve`, therefore the type doesn't matter.
  // `T` just makes TS happy.
  const cancelPromise = new Promise<T>((_resolve, reject) => {
    if (nonNullish(pollId)) {
      currentPolls.set(pollId, (err) => {
        reject(err);
      });
    }
  });
  try {
    for (let counter = 0; counter < maxAttempts; counter++) {
      if (counter > 0) {
        if (
          nonNullish(failuresBeforeHighLoadMessage) &&
          counter === failuresBeforeHighLoadMessage
        ) {
          highLoadToast = toastsError({
            labelKey: "error.high_load_retrying",
          });
        }
        await Promise.race([
          waitForMilliseconds(millisecondsToWait),
          cancelPromise,
        ]);
        if (useExponentialBackoff) {
          millisecondsToWait *= 2;
        }
      }

      try {
        const result = await Promise.race([fn(), cancelPromise]);
        return result;
      } catch (error: unknown) {
        if (shouldExit(error) || pollingCancelled(error)) {
          throw error;
        }
        // Log swallowed errors
        console.error(`Error polling: ${errorToString(error)}`);
      }
    }
    throw new PollingLimitExceededError();
  } finally {
    highLoadToast && toastsHide(highLoadToast);
    pollId && currentPolls.delete(pollId);
  }
};

export const pollingLimit = (error: unknown): boolean =>
  error instanceof PollingLimitExceededError;

export const pollingCancelled = (error: unknown): boolean =>
  error instanceof PollingCancelledError;

/**
 * Use to highlight a placeholder in a text rendered from i18n labels.
 * TODO: can maybe be replaced with a more meaningful semantic such as <mark></mark>
 */
export const valueSpan = (text: string): string =>
  `<span class="value">${text}</span>`;

/**
 * Removes entries from an object given a list of keys.
 *
 * @param {Object} params
 * @param {Object} params.obj object to remove entries from
 * @param {string[]} params.keysToRemove keys to remove
 * @returns new object with entries removed
 */
export const removeKeys = <T extends Record<string, unknown>>({
  obj,
  keysToRemove,
}: {
  obj: T;
  keysToRemove: string[];
}): T =>
  Object.entries(obj)
    .filter(([key]) => keysToRemove.indexOf(key) === -1)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {} as T);

/**
 * Access an object key with an index as string.
 * Cast to avoid issue "No index signature with a parameter of type 'string' was found on type '...'"
 */
export const keyOf = <T>({
  obj,
  key,
}: {
  obj: T;
  key: string | keyof T;
}): T[keyof T] => obj[key as keyof T];
export const keyOfOptional = <T>({
  obj,
  key,
}: {
  obj: T | undefined;
  key: string | keyof T;
}): T[keyof T] | undefined => obj?.[key as keyof T];

/**
 * Returns whether an asset is PNG or not.
 *
 * @param {string} asset
 * @returns boolean
 */
export const isPngAsset = (
  asset: string | undefined | PngDataUrl
): asset is PngDataUrl =>
  nonNullish(asset) &&
  (asset.startsWith("data:image/png;base64,") || asset.endsWith(".png"));

/**
 * Takes an object and tries to parse inner string as JSON.
 * If it fails, it returns the original string value.
 *
 * For example: {b: '{"c":"d"}'} becomes {b: {c: 'd'}}
 *
 * @param obj
 * @returns parsed object
 */
export const expandObject = (
  obj: Record<string, unknown>
): Record<string, unknown> =>
  Object.keys(obj).reduce((acc, key) => {
    const value = obj[key];
    if (typeof value === "string") {
      try {
        acc[key] = JSON.parse(value);
      } catch (e) {
        acc[key] = value;
      }
    } else if (typeof value === "object") {
      acc[key] =
        value !== null ? expandObject(value as Record<string, unknown>) : value;
    } else {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, unknown>);

/** "0" -> true; "" -> false; "-1" -> false */
export const isUIntString = (text: string): boolean => /^\d+$/.test(text);

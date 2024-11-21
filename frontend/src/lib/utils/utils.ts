import { toastsError, toastsHide } from "$lib/stores/toasts.store";
import type { PngDataUrl } from "$lib/types/assets";
import type { BasisPoints } from "$lib/types/proposals";
import { JSON_KEY_PRINCIPAL, type Principal } from "@dfinity/principal";
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
): string => {
  const __UNDEFINED__ = "__UNDEFINED__";
  const result = JSON.stringify(
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

          // For proposal rendering, historically we display {principal: "1234"}, but in stringified JSON, principals are now encoded as {"__principal__": "1234"}.
          if (nonNullish(value) && JSON_KEY_PRINCIPAL in value) {
            return value[JSON_KEY_PRINCIPAL];
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
      return value === undefined ? __UNDEFINED__ : value;
    },
    options?.indentation ?? 0
  );

  return (
    result?.replace(new RegExp(`"${__UNDEFINED__}"`, "g"), "undefined") ?? ""
  );
};

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

// Transforms one Record<> into another Record<> by mapping the
// entries with the provided function.
// An entry can be filtered out by returning `undefined`.
export const mapEntries = <V1, V2>({
  obj,
  mapFn,
}: {
  obj: Record<string, V1>;
  mapFn: (entry: [string, V1]) => [string, V2] | undefined;
}): Record<string, V2> =>
  Object.fromEntries(
    Object.entries(obj)
      .map((entry) => mapFn(entry))
      .filter((entry) => nonNullish(entry)) as Array<[string, V2]>
  );

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
export const expandObject = (value: unknown): unknown => {
  if (value === null || value === undefined) {
    return value;
  }
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (e: unknown) {
      return value;
    }
  }
  if (Array.isArray(value)) {
    return value.map(expandObject);
  }
  if (typeof value === "object") {
    if (isPrincipal(value)) {
      // Do not expand Principal to keep the prototype methods
      return value;
    }

    // to avoid mutating original object
    const result = { ...value };
    Object.keys(result).forEach(
      (key) =>
        ((result as Record<string, unknown>)[key] = expandObject(
          (result as Record<string, unknown>)[key]
        ))
    );
    return result;
  }
  return value;
};

export const sameBufferData = (
  buffer1: ArrayBuffer,
  buffer2: ArrayBuffer
): boolean => {
  if (buffer1.byteLength !== buffer2.byteLength) {
    return false;
  }
  const dv1 = new Int8Array(buffer1);
  const dv2 = new Int8Array(buffer2);
  for (let i = 0; i < buffer1.byteLength; i++) {
    if (dv1[i] !== dv2[i]) {
      return false;
    }
  }
  return true;
};

export const getObjMaxDepth = (obj: unknown): number => {
  if (typeof obj !== "object" || obj === null) {
    return 0; // If it's not an object, return 0.
  }

  const keyCount = Object.keys(obj).length;
  if (keyCount === 0) {
    return 0; // If it's an empty object, return 0.
  }
  // or calculate children depth
  let childrenMaxDepth = 0;
  for (const key in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(key)) {
      const depth = getObjMaxDepth((obj as Record<string, unknown>)[key]);
      if (depth > childrenMaxDepth) {
        childrenMaxDepth = depth;
      }
    }
  }

  return 1 + childrenMaxDepth; // Add 1 for the current level.
};

export const typeOfLikeANumber = (value: unknown): boolean =>
  typeof value === "number" ||
  typeof value === "bigint" ||
  (typeof value === "string" && value.length > 0 && !isNaN(Number(value)));

/**
 * Split a value into 8 characters chunks
 * @example
 * 00001111222233334444 --> ["0000", "11112222", "33334444"]
 */
export const splitE8sIntoChunks = (value: unknown): string[] => {
  if (!typeOfLikeANumber(value)) {
    console.error("splitE8sIntoChunks: value is not a number");
    return [`${stringifyJson(value)}`];
  }

  const chars = `${value}`.split("");
  const chunks: string[] = [];
  for (let i = chars.length; i > 0; i -= 8) {
    const chunk = chars.slice(Math.max(i - 8, 0), i);
    chunks.unshift(chunk.join(""));
  }

  return chunks;
};

export const basisPointsToPercent = (basisPoints: BasisPoints): number =>
  Number(basisPoints) / 100;

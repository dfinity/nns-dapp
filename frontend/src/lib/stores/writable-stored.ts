import { browser } from "$app/environment";
import type { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import { nonNullish } from "@dfinity/utils";
import { writable, type Unsubscriber, type Writable } from "svelte/store";

type WritableStored<T> = Writable<T> & {
  unsubscribeStorage: Unsubscriber;
  /** Update the store state and write it to local storage when the current version is older. */
  upgradeStateVersion: (data: { newVersionValue: T; version: number }) => void;
};

type VersionedData<T> = { data: T; version: number };

/** Returns true when the value has numeric version and data fields. */
const isVersionedData = <T>(
  data: T | VersionedData<T>
): data is VersionedData<T> =>
  nonNullish(data) &&
  typeof data === "object" &&
  getVersion(data) !== undefined &&
  Object.hasOwn(data, "data");

/** Writes the state (w/ the version) to local storage. */
const writeData = <T>({
  key,
  data,
  version,
}: {
  key: StoreLocalStorageKey;
  data: T;
  version?: number;
}) => {
  // Do not break UI if local storage fails
  try {
    // TODO: can / should we replace this replacer with json.utils.jsonReplacer? is it possible without breaking changes?
    const bigintStringify = (_key: string, value: unknown): unknown =>
      typeof value === "bigint" ? `${value}` : value;
    // Data structure  `{ data, version }` vs `data` depends on version absence.

    const storeData: T | VersionedData<T> = nonNullish(version)
      ? { data, version }
      : data;
    localStorage.setItem(key, JSON.stringify(storeData, bigintStringify));
  } catch (error: unknown) {
    console.error(error);
  }
};

/** Returns the version field of the value if it has one, otherwise undefined. */
const getVersion = <T>(data: T | VersionedData<T>): number | undefined => {
  if (
    typeof data === "object" &&
    data !== null &&
    Object.hasOwn(data, "version")
  ) {
    const version = Number(
      (data as unknown as { version: number | string }).version
    );
    if (!isNaN(version)) {
      return version;
    }
  }
  // default
  return undefined;
};

const readData = <T>(
  key: StoreLocalStorageKey
): { data: T | undefined; version: number | undefined } => {
  // Do not break UI if local storage fails
  try {
    const storedValue = localStorage.getItem(key);
    // `theme` stored "undefined" string which is not a valid JSON string.
    if (
      storedValue !== null &&
      storedValue !== undefined &&
      storedValue !== "undefined"
    ) {
      const parsedValue = JSON.parse(storedValue) as T;
      if (isVersionedData(parsedValue)) {
        return parsedValue;
      }

      return { data: parsedValue, version: undefined };
    }
  } catch (error: unknown) {
    console.error(error);
  }

  return { data: undefined, version: undefined };
};

export const writableStored = <T>({
  key,
  defaultValue,
  version,
}: {
  key: StoreLocalStorageKey;
  defaultValue: T;
  version?: number;
}): WritableStored<T> => {
  const getInitialValue = (value: T): T => {
    if (!browser) {
      return value;
    }

    const storedValue = readData<T>(key);
    if ((version ?? 0) > (storedValue.version ?? 0)) {
      // remove deprecated version from local storage
      localStorage.removeItem(key);
      return defaultValue;
    }

    return storedValue.data ?? defaultValue;
  };

  const store = writable<T>(getInitialValue(defaultValue));

  const unsubscribeStorage = store.subscribe((store: T) => {
    if (!browser) {
      return;
    }

    writeData({ key, data: store, version });
  });

  const upgradeStateVersion = ({
    newVersionValue,
    version,
  }: {
    newVersionValue: T;
    version: number;
  }) => {
    const storedValue = readData<T>(key);
    if ((version ?? 0) > (storedValue.version ?? 0)) {
      store.set(newVersionValue);
      // rewrite local storage with the new version
      writeData({
        key,
        data: newVersionValue,
        version,
      });
    } else {
      console.error("Same or newer version in store.");
    }
  };

  return {
    ...store,
    unsubscribeStorage,
    upgradeStateVersion,
  };
};

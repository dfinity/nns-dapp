import { browser } from "$app/environment";
import type { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import { jsonReplacer, jsonReviver, nonNullish } from "@dfinity/utils";
import { writable, type Unsubscriber, type Writable } from "svelte/store";

type WritableStored<T> = Writable<T> & {
  unsubscribeStorage: Unsubscriber;
  /** Update the store state and write it to local storage when the current version is older. */
  upgradeStateVersion: (data: { newVersionValue: T; version: number }) => void;
};

type VersionedData<T> = { data: T | undefined; version: number | undefined };

/** Returns true when the value has numeric version and data fields. */
const isVersionedData = <T>(
  data: T | VersionedData<T>
): data is VersionedData<T> =>
  nonNullish(data) &&
  typeof data === "object" &&
  getVersion(data) !== undefined &&
  Object.hasOwn(data, "data");

/** Writes the state (w/ or w/o the version) to local storage. */
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
    // Data structure  `{ data, version }` vs `data` depends on version absence.
    const storeData: T | VersionedData<T> = nonNullish(version)
      ? { data, version }
      : data;
    localStorage.setItem(key, JSON.stringify(storeData, jsonReplacer));
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

/** Reads the state (w/ or w/o the version) from local storage and returns the versioned state. */
const readData = <T>(key: StoreLocalStorageKey): VersionedData<T> => {
  // Do not break UI if local storage fails
  try {
    const storedValue = localStorage.getItem(key);
    // `theme` stored "undefined" string which is not a valid JSON string.
    if (
      storedValue !== null &&
      storedValue !== undefined &&
      storedValue !== "undefined"
    ) {
      const parsedValue = JSON.parse(storedValue, jsonReviver);

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
  version: defaultVersion,
}: {
  key: StoreLocalStorageKey;
  defaultValue: T;
  version?: number;
}): WritableStored<T> => {
  const getInitialValue = (): VersionedData<T> => {
    if (!browser) {
      return { data: defaultValue, version: defaultVersion };
    }

    const storedValue = readData<T>(key);
    // use default value if local storage is empty or obsolete
    if (
      storedValue.data === undefined ||
      (defaultVersion ?? 0) > (storedValue.version ?? 0)
    ) {
      // replace deprecated version in local storage
      writeData({ key, data: defaultValue, version: defaultVersion });
      return { data: defaultValue, version: defaultVersion };
    }

    return storedValue;
  };

  const initialValue = getInitialValue();
  // preserve the version because there are only data in the store
  let actualVersion: number | undefined = initialValue.version;
  const store = writable<T>(initialValue.data);

  const unsubscribeStorage = store.subscribe((store: T) => {
    if (!browser) {
      return;
    }

    writeData({ key, data: store, version: actualVersion });
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
      actualVersion = version;
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

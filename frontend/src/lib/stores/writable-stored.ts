import { writable, type Writable } from "svelte/store";
import type { storeLocalStorageKey } from "../constants/stores.constants";

type StoredWritable<T> = Writable<T> & {
  unsubscribeStorage: () => void;
};

export const writableStored = <T>({
  key,
  defaultValue,
}: {
  key: storeLocalStorageKey;
  defaultValue: T;
}): StoredWritable<T> => {
  const getInitialValue = (): T => {
    // Do not break UI if local storage fails
    try {
      const storedValue = localStorage.getItem(key);
      // `theme` stored "undefined" string which is not a valid JSON string.
      if (
        storedValue !== null &&
        storedValue !== undefined &&
        storedValue !== "undefined"
      ) {
        return JSON.parse(storedValue) as T;
      }
    } catch (error) {
      console.error(error);
    }
    return defaultValue;
  };

  const store = writable<T>(getInitialValue());

  const unsubscribeStorage = store.subscribe((store: T) => {
    // Do not break UI if local storage fails
    try {
      localStorage.setItem(key, JSON.stringify(store));
    } catch (error) {
      console.error(error);
    }
  });

  return {
    ...store,
    unsubscribeStorage,
  };
};

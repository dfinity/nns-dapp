import type { storeLocalStorageKey } from "$lib/constants/stores.constants";
import { writable, type Unsubscriber, type Writable } from "svelte/store";
import {browser} from "$app/environment";

type WritableStored<T> = Writable<T> & {
  unsubscribeStorage: Unsubscriber;
};

export const writableStored = <T>({
  key,
  defaultValue,
}: {
  key: storeLocalStorageKey;
  defaultValue: T;
}): WritableStored<T> => {
  const getInitialValue = (): T => {
    if (!browser) {
      return defaultValue;
    }

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
    } catch (error: unknown) {
      console.error(error);
    }
    return defaultValue;
  };

  const store = writable<T>(getInitialValue());

  const unsubscribeStorage = store.subscribe((store: T) => {
    if (!browser) {
      return;
    }

    // Do not break UI if local storage fails
    try {
      localStorage.setItem(key, JSON.stringify(store));
    } catch (error: unknown) {
      console.error(error);
    }
  });

  return {
    ...store,
    unsubscribeStorage,
  };
};

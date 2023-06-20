import { browser } from "$app/environment";
import type { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import { writable, type Unsubscriber, type Writable } from "svelte/store";

type WritableStored<T> = Writable<T> & {
  unsubscribeStorage: Unsubscriber;
};

export const writableStored = <T>({
  key,
  defaultValue,
}: {
  key: StoreLocalStorageKey;
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
      // TODO: can / should we replace this replacer with json.utils.jsonReplacer? is it possible without breaking changes?
      const bigintStringify = (_key: string, value: unknown): unknown =>
        typeof value === "bigint" ? `${value}` : value;

      localStorage.setItem(key, JSON.stringify(store, bigintStringify));
    } catch (error: unknown) {
      console.error(error);
    }
  });

  return {
    ...store,
    unsubscribeStorage,
  };
};

import { writable } from "svelte/store";
import type { storeLocalStorageKey } from "../constants/stores.constants";

export const writableStored = <T>({
  key,
  defaultValue,
}: {
  key: storeLocalStorageKey;
  defaultValue: T;
}) => {
  const getInitialValue = (): T => {
    const filters = localStorage.getItem(key);
    if (filters !== null) {
      return JSON.parse(filters) as T;
    }
    return defaultValue;
  };

  const store = writable<T>(getInitialValue());

  store.subscribe((store) => {
    localStorage.setItem(key, JSON.stringify(store));
  });

  return store;
};

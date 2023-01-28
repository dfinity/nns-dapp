import { writable } from "svelte/store";

/**
 * Store to keep track of the number of calls avoided by caching.
 */
const initCachingCallsStore = () => {
  const { subscribe, update } = writable<number>(0);

  return {
    subscribe,

    increment() {
      update((n) => n + 1);
    },
  };
};

export const cachingCallsStore = initCachingCallsStore();

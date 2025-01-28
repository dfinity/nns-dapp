import type { AppPath } from "$lib/constants/routes.constants";
import { writable } from "svelte/store";

const MAX_SIZE_REFERRER_PATHS = 10;
const initReferrerPathStore = () => {
  const { update, subscribe } = writable<AppPath[]>([]);

  return {
    pushPath: (path: AppPath) =>
      update((paths) => [...paths, path].slice(-MAX_SIZE_REFERRER_PATHS)),
    subscribe,
  };
};

export const referrerPathStore = initReferrerPathStore();

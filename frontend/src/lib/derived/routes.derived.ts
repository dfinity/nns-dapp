import { AppPath } from "$lib/constants/routes.constants";
import { referrerPathStore } from "$lib/stores/routes.store";
import { derived, type Readable } from "svelte/store";

export const accountsPageOrigin: Readable<AppPath> = derived(
  referrerPathStore,
  ($paths) => {
    const lastPath = [...$paths]
      .reverse()
      .find((path) => path === AppPath.Portfolio || path === AppPath.Tokens);
    return lastPath ?? AppPath.Tokens;
  }
);

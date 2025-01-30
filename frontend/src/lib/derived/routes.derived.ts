import { AppPath } from "$lib/constants/routes.constants";
import { referrerPathStore } from "$lib/stores/routes.store";
import { derived, type Readable } from "svelte/store";

/**
 * Derives the origin page (Portfolio or Tokens) to return from Accounts.
 * Looks at last three entries to handle navigation flows:
 * Portfolio/Tokens -> Accounts -> Wallet -> (back) -> Accounts -> (back) -> Origin
 *
 * Returns AppPath.Tokens as default if no matching page is found.
 */
export const accountsPageOrigin: Readable<AppPath> = derived(
  referrerPathStore,
  ($paths) => {
    const lastPath = [...$paths]
      .reverse()
      .slice(0, 3)
      .find((path) => path === AppPath.Portfolio || path === AppPath.Tokens);
    return lastPath ?? AppPath.Tokens;
  }
);

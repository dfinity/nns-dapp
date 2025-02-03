import { AppPath } from "$lib/constants/routes.constants";
import { accountsPathStore } from "$lib/derived/paths.derived";
import { isNnsUniverseStore } from "$lib/derived/selected-universe.derived";
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

/**
 * Derives the origin page (Portfolio, Tokens or Accounts) to return from Wallets.
 * Looks at last entry to handle navigation flows:
 * Portfolio -> Wallet -> (back) -> Portfolio
 * Accounts -> Wallet -> (back) -> Accounts
 * Tokens -> Wallet -> (back) -> Tokens
 *
 * Returns AppPath.Tokens as default if no matching page is found.
 */
export const walletPageOrigin = derived(
  [referrerPathStore, isNnsUniverseStore, accountsPathStore],
  ([paths, isNnsUniverse, accountsPath]) => {
    const lastPath = paths.at(-1);

    if (lastPath === AppPath.Portfolio) return lastPath;
    if (isNnsUniverse) return accountsPath;
    return AppPath.Tokens;
  }
);

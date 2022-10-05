import { snsProjectSelectedStore } from "$lib/derived/selected-project.derived";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import type { Account } from "$lib/types/account";
import { derived, type Readable } from "svelte/store";

const mainAccount = (accounts: Account[]): Account | undefined => {
  return accounts.find((account) => account.type === "main");
};

/**
 * Main account is put in the first position. The rest of the accounts keep the same order.
 *
 * @param accounts: Array of accounts
 * @returns accounts
 */
const sortAccounts = (accounts: Account[]): Account[] => {
  const nonMainAccounts: Account[] = accounts.filter(
    ({ type }) => type !== "main"
  );
  const main = mainAccount(accounts);
  return [...(main !== undefined ? [main] : []), ...nonMainAccounts];
};

export const snsProjectAccountsStore: Readable<Account[] | undefined> = derived(
  [snsAccountsStore, snsProjectSelectedStore],
  ([store, selectedSnsRootCanisterId]) => {
    const projectStore = store[selectedSnsRootCanisterId.toText()];
    return projectStore === undefined
      ? undefined
      : sortAccounts(projectStore.accounts);
  }
);

export const snsProjectMainAccountStore: Readable<Account | undefined> =
  derived(
    [snsAccountsStore, snsProjectSelectedStore],
    ([store, selectedSnsRootCanisterId]) => {
      const projectStore = store[selectedSnsRootCanisterId.toText()];
      return projectStore === undefined
        ? undefined
        : mainAccount(projectStore.accounts);
    }
  );

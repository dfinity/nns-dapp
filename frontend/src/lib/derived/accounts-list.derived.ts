/**
 * A derived store that returns the accounts as an array of accounts.
 */

import { accountsStore } from "$lib/stores/accounts.store";
import type { Account } from "$lib/types/account";
import { derived, type Readable } from "svelte/store";
import { isNnsProjectStore } from "./selected-project.derived";
import { snsProjectAccountsStore } from "./sns/sns-project-accounts.derived";

export const nnsAccountsListStore: Readable<Account[]> = derived(
  accountsStore,
  ({ main, subAccounts, hardwareWallets }) =>
    main === undefined
      ? []
      : [main, ...(subAccounts ?? []), ...(hardwareWallets ?? [])]
);

/**
 * Returns the accounts of the project matching the context.
 */
export const accountsSelectedProjectStore: Readable<Account[]> = derived(
  [nnsAccountsListStore, isNnsProjectStore, snsProjectAccountsStore],
  ([nnsAccounts, isNns, snsAccounts]) =>
    isNns ? nnsAccounts : snsAccounts ?? []
);

/**
 * A derived store that returns the accounts as an array of accounts.
 */

import { accountsStore } from "$lib/stores/accounts.store";
import type { Account } from "$lib/types/account";
import { derived, type Readable } from "svelte/store";

export const nnsAccountsListStore: Readable<Account[]> = derived(
  accountsStore,
  ({ main, subAccounts, hardwareWallets }) =>
    main === undefined
      ? []
      : [main, ...(subAccounts ?? []), ...(hardwareWallets ?? [])]
);

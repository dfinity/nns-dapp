/**
 * A derived store that returns the accounts as an array of accounts.
 */

import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import type { Account } from "$lib/types/account";
import type { UniverseCanisterIdText } from "$lib/types/universe";
import { derived, type Readable } from "svelte/store";

export const nnsAccountsListStore: Readable<Account[]> = derived(
  icpAccountsStore,
  ({ main, subAccounts, hardwareWallets }) =>
    main === undefined
      ? []
      : [main, ...(subAccounts ?? []), ...(hardwareWallets ?? [])]
);

export type UniversesAccounts = Record<UniverseCanisterIdText, Account[]>;

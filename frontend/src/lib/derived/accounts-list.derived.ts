/**
 * A derived store that returns the accounts as an array of accounts.
 */

import { isNnsProjectStore } from "$lib/derived/selected-project.derived";
import { snsProjectAccountsStore } from "$lib/derived/sns/sns-project-accounts.derived";
import { accountsStore } from "$lib/stores/accounts.store";
import { derived } from "svelte/store";

export const accountsListStore = derived(
  [accountsStore, isNnsProjectStore, snsProjectAccountsStore],
  ([{ main, subAccounts, hardwareWallets }, isNns, projectAccounts]) => {
    if (isNns) {
      return main === undefined
        ? []
        : [main, ...(subAccounts ?? []), ...(hardwareWallets ?? [])];
    }
    return projectAccounts ?? [];
  }
);

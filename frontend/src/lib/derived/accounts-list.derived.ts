/**
 * A derived store that returns the accounts as an array of accounts.
 */

import { accountsStore } from "$lib/stores/accounts.store";
import { derived } from "svelte/store";
import { isNnsProjectStore } from "./selected-project.derived";
import { snsProjectAccountsStore } from "./sns/sns-project-accounts.derived";

export const accountsListStore = derived(
  [accountsStore, isNnsProjectStore, snsProjectAccountsStore],
  ([{ main, subAccounts, hardwareWallets }, isNns, snsAccounts]) => {
    if (isNns) {
      return main === undefined
        ? []
        : [main, ...(subAccounts ?? []), ...(hardwareWallets ?? [])];
    }
    return snsAccounts ?? [];
  }
);

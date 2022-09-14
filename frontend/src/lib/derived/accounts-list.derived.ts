/**
 * A derived store that returns the accounts as an array of accounts.
 */

import { derived } from "svelte/store";
import { accountsStore } from "../stores/accounts.store";

export const accountsList = derived(
  accountsStore,
  ({ main, subAccounts, hardwareWallets }) =>
    main === undefined
      ? []
      : [main, ...(subAccounts ?? []), ...(hardwareWallets ?? [])]
);

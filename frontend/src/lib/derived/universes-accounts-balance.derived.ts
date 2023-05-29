import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { accountsStore, type AccountsStore } from "$lib/stores/accounts.store";
import type { IcrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import {
  snsAccountsStore,
  type SnsAccountsStore,
} from "$lib/stores/sns-accounts.store";
import type { RootCanisterIdText } from "$lib/types/sns";
import { sumAccounts, sumNnsAccounts } from "$lib/utils/accounts.utils";
import { derived } from "svelte/store";

export interface UniverseAccountsBalance {
  balanceE8s: bigint | undefined;
  certified: boolean;
}

export type UniversesAccountsBalanceReadableStore = Record<
  RootCanisterIdText,
  UniverseAccountsBalance
>;

export const universesAccountsBalance = derived<
  [AccountsStore, SnsAccountsStore, IcrcAccountsStore],
  UniversesAccountsBalanceReadableStore
>(
  [accountsStore, snsAccountsStore, icrcAccountsStore],
  ([$accountsStore, $snsAccountsStore, $icrcAccountsStore]) => ({
    [OWN_CANISTER_ID_TEXT]: {
      balance: sumNnsAccounts($accountsStore),
      certified: $accountsStore.certified ?? false,
    },
    ...Object.entries($icrcAccountsStore).reduce(
      (acc, [canisterId, { accounts, certified }]) => ({
        ...acc,
        [canisterId]: {
          balance: sumAccounts(accounts),
          certified,
        },
      }),
      {}
    ),
    ...Object.entries($snsAccountsStore).reduce(
      (acc, [rootCanisterId, { accounts, certified }]) => ({
        ...acc,
        [rootCanisterId]: {
          balance: sumAccounts(accounts),
          certified,
        },
      }),
      {}
    ),
  })
);

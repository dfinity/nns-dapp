import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import {
  icpAccountsStore,
  type IcpAccountsStore,
} from "$lib/stores/icp-accounts.store";
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
  [IcpAccountsStore, SnsAccountsStore, IcrcAccountsStore],
  UniversesAccountsBalanceReadableStore
>(
  [icpAccountsStore, snsAccountsStore, icrcAccountsStore],
  ([$accountsStore, $snsAccountsStore, $icrcAccountsStore]) => ({
    [OWN_CANISTER_ID_TEXT]: {
      balanceE8s: sumNnsAccounts($accountsStore),
      certified: $accountsStore.certified ?? false,
    },
    ...Object.entries($icrcAccountsStore).reduce(
      (acc, [canisterId, { accounts, certified }]) => ({
        ...acc,
        [canisterId]: {
          balanceE8s: sumAccounts(accounts),
          certified,
        },
      }),
      {}
    ),
    ...Object.entries($snsAccountsStore).reduce(
      (acc, [rootCanisterId, { accounts, certified }]) => ({
        ...acc,
        [rootCanisterId]: {
          balanceE8s: sumAccounts(accounts),
          certified,
        },
      }),
      {}
    ),
  })
);

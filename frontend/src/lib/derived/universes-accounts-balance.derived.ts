import {
  CKBTC_UNIVERSE_CANISTER_ID,
  OWN_CANISTER_ID_TEXT,
} from "$lib/constants/canister-ids.constants";
import { accountsStore, type AccountsStore } from "$lib/stores/accounts.store";
import type { CkBTCAccountsStore } from "$lib/stores/ckbtc-accounts.store";
import { ckBTCAccountsStore } from "$lib/stores/ckbtc-accounts.store";
import {
  snsAccountsStore,
  type SnsAccountsStore,
} from "$lib/stores/sns-accounts.store";
import type { RootCanisterIdText } from "$lib/types/sns";
import { sumAccounts, sumNnsAccounts } from "$lib/utils/accounts.utils";
import type { TokenAmount } from "@dfinity/nns";
import { derived } from "svelte/store";

export interface UniverseAccountsBalance {
  balance: TokenAmount | undefined;
  certified: boolean;
}

export type UniversesAccountsBalanceReadableStore = Record<
  RootCanisterIdText,
  UniverseAccountsBalance
>;

export const universesAccountsBalance = derived<
  [AccountsStore, SnsAccountsStore, CkBTCAccountsStore],
  UniversesAccountsBalanceReadableStore
>(
  [accountsStore, snsAccountsStore, ckBTCAccountsStore],
  ([$accountsStore, $snsAccountsStore, $ckBTCAccountsStore]) => ({
    [OWN_CANISTER_ID_TEXT]: {
      balance: sumNnsAccounts($accountsStore),
      certified: $accountsStore.certified ?? false,
    },
    [CKBTC_UNIVERSE_CANISTER_ID.toText()]: {
      balance: sumAccounts($ckBTCAccountsStore.accounts),
      certified: $ckBTCAccountsStore.certified,
    },
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

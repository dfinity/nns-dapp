import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { accountsStore, type AccountsStore } from "$lib/stores/accounts.store";
import {
  snsAccountsBalanceStore,
  type SnsAccountsBalanceStore,
} from "$lib/stores/sns-accounts-balance.store";
import type { RootCanisterIdText } from "$lib/types/sns";
import { sumAccounts as sumNnsAccounts } from "$lib/utils/accounts.utils";
import type { TokenAmount } from "@dfinity/nns";
import { derived } from "svelte/store";

export interface ProjectAccountsBalance {
  balance: TokenAmount | undefined | null;
  certified: boolean;
}

export type ProjectAccountsBalanceReadableStore = Record<
  RootCanisterIdText,
  ProjectAccountsBalance
>;

export const projectsAccountsBalance = derived<
  [AccountsStore, SnsAccountsBalanceStore],
  ProjectAccountsBalanceReadableStore
>(
  [accountsStore, snsAccountsBalanceStore],
  ([$accountsStore, $snsAccountsBalanceStore]) => ({
    [OWN_CANISTER_ID_TEXT]: {
      balance: sumNnsAccounts($accountsStore),
      certified: $accountsStore.certified ?? false,
    },
    ...$snsAccountsBalanceStore,
  })
);

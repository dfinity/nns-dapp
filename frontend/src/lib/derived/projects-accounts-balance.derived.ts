import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { accountsStore, type AccountsStore } from "$lib/stores/accounts.store";
import {
  snsAccountsStore,
  type SnsAccountsStore,
} from "$lib/stores/sns-accounts.store";
import type { RootCanisterIdText } from "$lib/types/sns";
import { sumAccounts as sumNnsAccounts } from "$lib/utils/accounts.utils";
import { sumAccounts as sumSnsAccounts } from "$lib/utils/sns-accounts.utils";
import type { TokenAmount } from "@dfinity/nns";
import { derived } from "svelte/store";

export interface ProjectAccountsBalance {
  balance: TokenAmount | undefined;
  certified: boolean;
}

export type ProjectAccountsBalanceReadableStore = Record<
  RootCanisterIdText,
  ProjectAccountsBalance
>;

export const projectsAccountsBalance = derived<
  [AccountsStore, SnsAccountsStore],
  ProjectAccountsBalanceReadableStore
>([accountsStore, snsAccountsStore], ([$accountsStore, $snsAccountsStore]) => ({
  [OWN_CANISTER_ID_TEXT]: {
    balance: sumNnsAccounts($accountsStore),
    certified: $accountsStore.certified ?? false,
  },
  ...Object.entries($snsAccountsStore).reduce(
    (acc, [rootCanisterId, { accounts, certified }]) => ({
      ...acc,
      [rootCanisterId]: {
        balance: sumSnsAccounts(accounts),
        certified,
      },
    }),
    {}
  ),
}));

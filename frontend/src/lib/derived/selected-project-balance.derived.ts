import { snsProjectIdSelectedStore } from "$lib/derived/selected-project.derived";
import { snsProjectAccountsStore } from "$lib/derived/sns/sns-project-accounts.derived";
import { accountsStore, type AccountsStore } from "$lib/stores/accounts.store";
import type { Account } from "$lib/types/account";
import { sumAccounts as sumNnsAccounts } from "$lib/utils/accounts.utils";
import { isNnsProject } from "$lib/utils/projects.utils";
import { sumAccounts as sumSnsAccounts } from "$lib/utils/sns-accounts.utils";
import type { TokenAmount } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import { derived, type Readable } from "svelte/store";

export interface SelectedProjectBalance {
  canisterId: Principal;
  balance: TokenAmount | undefined;
}

export const selectedProjectBalance = derived<
  [
    Readable<Principal>,
    Readable<AccountsStore>,
    Readable<Account[] | undefined>
  ],
  SelectedProjectBalance
>(
  [snsProjectIdSelectedStore, accountsStore, snsProjectAccountsStore],
  ([$snsProjectIdSelectedStore, $accountsStore, $snsProjectAccountsStore]) => ({
    canisterId: $snsProjectIdSelectedStore,
    balance: isNnsProject($snsProjectIdSelectedStore)
      ? sumNnsAccounts($accountsStore)
      : sumSnsAccounts($snsProjectAccountsStore),
  })
);

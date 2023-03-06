import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import type { UniversesAccounts } from "$lib/derived/accounts-list.derived";
import { nnsAccountsListStore } from "$lib/derived/accounts-list.derived";
import {
  icrcAccountsStore,
  type IcrcAccountsStore,
} from "$lib/stores/icrc-accounts.store";
import {
  snsAccountsStore,
  type SnsAccountsStore,
} from "$lib/stores/sns-accounts.store";
import type { Account } from "$lib/types/account";
import { derived, type Readable } from "svelte/store";

export const universesAccountsStore = derived<
  [Readable<Account[]>, SnsAccountsStore, IcrcAccountsStore],
  UniversesAccounts
>(
  [nnsAccountsListStore, snsAccountsStore, icrcAccountsStore],
  ([$nnsAccountsListStore, $snsAccountsStore, $icrcAccountsStore]) => ({
    [OWN_CANISTER_ID_TEXT]: $nnsAccountsListStore,
    ...Object.entries($icrcAccountsStore).reduce(
      (acc, [canisterId, { accounts }]) => ({
        ...acc,
        [canisterId]: accounts,
      }),
      {}
    ),
    ...Object.entries($snsAccountsStore).reduce(
      (acc, [rootCanisterId, { accounts }]) => ({
        ...acc,
        [rootCanisterId]: accounts,
      }),
      {}
    ),
  })
);

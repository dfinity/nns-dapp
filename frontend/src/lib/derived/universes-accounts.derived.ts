import {
  CKBTC_UNIVERSE_CANISTER_ID,
  OWN_CANISTER_ID_TEXT,
} from "$lib/constants/canister-ids.constants";
import type { UniversesAccounts } from "$lib/derived/accounts-list.derived";
import { nnsAccountsListStore } from "$lib/derived/accounts-list.derived";
import {
  ckBTCAccountsStore,
  type CkBTCAccountsStore,
} from "$lib/stores/ckbtc-accounts.store";
import {
  snsAccountsStore,
  type SnsAccountsStore,
} from "$lib/stores/sns-accounts.store";
import type { Account } from "$lib/types/account";
import { derived, type Readable } from "svelte/store";

export const universesAccountsStore = derived<
  [Readable<Account[]>, SnsAccountsStore, CkBTCAccountsStore],
  UniversesAccounts
>(
  [nnsAccountsListStore, snsAccountsStore, ckBTCAccountsStore],
  ([$nnsAccountsListStore, $snsAccountsStore, $ckBTCAccountsStore]) => ({
    [OWN_CANISTER_ID_TEXT]: $nnsAccountsListStore,
    [CKBTC_UNIVERSE_CANISTER_ID.toText()]: $ckBTCAccountsStore.accounts,
    ...Object.entries($snsAccountsStore).reduce(
      (acc, [rootCanisterId, { accounts }]) => ({
        ...acc,
        [rootCanisterId]: accounts,
      }),
      {}
    ),
  })
);

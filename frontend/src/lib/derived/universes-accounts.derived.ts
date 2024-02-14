import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import type { UniversesAccounts } from "$lib/derived/accounts-list.derived";
import { nnsAccountsListStore } from "$lib/derived/accounts-list.derived";
import { snsLedgerCanisterIdsStore } from "$lib/derived/sns/sns-canisters.derived";
import {
  icrcAccountsStore,
  type IcrcAccountsStore,
} from "$lib/stores/icrc-accounts.store";
import type { Account } from "$lib/types/account";
import type { Principal } from "@dfinity/principal";
import { derived, type Readable } from "svelte/store";

export const universesAccountsStore = derived<
  [Readable<Account[]>, Readable<Record<string, Principal>>, IcrcAccountsStore],
  UniversesAccounts
>(
  [nnsAccountsListStore, snsLedgerCanisterIdsStore, icrcAccountsStore],
  ([$nnsAccountsListStore, $snsLedgerCanisterIdsStore, $icrcAccountsStore]) => {
    const snsLedgerToRootCanisterId = Object.fromEntries(
      Object.entries($snsLedgerCanisterIdsStore).map(
        ([rootCanisterId, ledgerCanisterId]) => [
          ledgerCanisterId.toText(),
          rootCanisterId,
        ]
      )
    );

    return {
      [OWN_CANISTER_ID_TEXT]: $nnsAccountsListStore,
      ...Object.entries($icrcAccountsStore).reduce(
        (acc, [ledgerCanisterId, { accounts }]) => {
          const universeId =
            snsLedgerToRootCanisterId[ledgerCanisterId] ?? ledgerCanisterId;
          return {
            ...acc,
            [universeId]: accounts,
          };
        },
        {}
      ),
    };
  }
);

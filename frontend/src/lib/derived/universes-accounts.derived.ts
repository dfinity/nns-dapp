import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import type { UniversesAccounts } from "$lib/derived/accounts-list.derived";
import { nnsAccountsListStore } from "$lib/derived/accounts-list.derived";
import { snsLedgerCanisterIdsStore } from "$lib/derived/sns/sns-canisters.derived";
import {
  icrcAccountsStore,
  type IcrcAccountsStore,
} from "$lib/stores/icrc-accounts.store";
import type { Account } from "$lib/types/account";
import { mapEntries } from "$lib/utils/utils";
import type { Principal } from "@dfinity/principal";
import { derived, type Readable } from "svelte/store";

export const universesAccountsStore = derived<
  [Readable<Account[]>, Readable<Record<string, Principal>>, IcrcAccountsStore],
  UniversesAccounts
>(
  [nnsAccountsListStore, snsLedgerCanisterIdsStore, icrcAccountsStore],
  ([$nnsAccountsListStore, $snsLedgerCanisterIdsStore, $icrcAccountsStore]) => {
    const snsLedgerToRootCanisterId = mapEntries({
      obj: $snsLedgerCanisterIdsStore,
      mapFn: ([rootCanisterId, ledgerCanisterId]) => [
        ledgerCanisterId.toText(),
        rootCanisterId,
      ],
    });

    return {
      [OWN_CANISTER_ID_TEXT]: $nnsAccountsListStore,
      ...mapEntries({
        obj: $icrcAccountsStore,
        mapFn: ([ledgerCanisterId, { accounts }]) => {
          const universeId =
            snsLedgerToRootCanisterId[ledgerCanisterId] ?? ledgerCanisterId;
          return [universeId, accounts];
        },
      }),
    };
  }
);

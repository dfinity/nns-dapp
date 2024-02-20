import { snsLedgerCanisterIdsStore } from "$lib/derived/sns/sns-canisters.derived";
import {
  icrcAccountsStore,
  type IcrcAccountsStore,
} from "$lib/stores/icrc-accounts.store";
import type { Account } from "$lib/types/account";
import type { RootCanisterIdText } from "$lib/types/sns";
import type { Principal } from "@dfinity/principal";
import { nonNullish } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";

interface SnsAccount {
  accounts: Account[];
  certified: boolean;
}

// Each SNS Project is an entry in this Store.
// We use the root canister id as the key to identify the accounts for a specific project.
export type SnsAccountsStoreData = Record<RootCanisterIdText, SnsAccount>;

export type SnsAccountsStore = Readable<SnsAccountsStoreData>;

export const snsAccountsStore = derived<
  [IcrcAccountsStore, Readable<Record<string, Principal>>],
  SnsAccountsStoreData
>(
  [icrcAccountsStore, snsLedgerCanisterIdsStore],
  ([icrcAccounts, snsLedgerCanisterIds]): SnsAccountsStoreData => {
    return Object.fromEntries(
      Object.entries(snsLedgerCanisterIds)
        .map(([rootCanisterId, ledgerCanisterId]) => [
          rootCanisterId,
          icrcAccounts[ledgerCanisterId.toText()],
        ])
        .filter(([_, accounts]) => nonNullish(accounts))
    );
  }
);

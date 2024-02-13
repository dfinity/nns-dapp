import type { UniversesAccounts } from "$lib/derived/accounts-list.derived";
import { universesAccountsStore } from "$lib/derived/universes-accounts.derived";
import type { RootCanisterIdText } from "$lib/types/sns";
import { sumAccounts } from "$lib/utils/accounts.utils";
import { derived, type Readable } from "svelte/store";

export type UniversesAccountsBalanceReadableStore = Record<
  RootCanisterIdText,
  bigint | undefined
>;

export const universesAccountsBalance = derived<
  Readable<UniversesAccounts>,
  UniversesAccountsBalanceReadableStore
>(universesAccountsStore, ($universesAccountsStore) =>
  Object.fromEntries(
    Object.entries($universesAccountsStore).map(([universeId, accounts]) => [
      universeId,
      sumAccounts(accounts),
    ])
  )
);

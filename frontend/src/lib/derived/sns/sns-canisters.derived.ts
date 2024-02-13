import { snsSummariesStore } from "$lib/stores/sns.store";
import type { SnsSummary } from "$lib/types/sns";
import type { Principal } from "@dfinity/principal";
import { derived, type Readable } from "svelte/store";

// Holds a Record mapping root canister ids ledger canister ids.
export const snsLedgerCanisterIdsStore = derived<
  Readable<SnsSummary[]>,
  Record<string, Principal>
>(
  snsSummariesStore,
  (summaries): Record<string, Principal> =>
    summaries.reduce(
      (acc, summary) => ({
        ...acc,
        [summary.rootCanisterId.toText()]: summary.ledgerCanisterId,
      }),
      {}
    )
);

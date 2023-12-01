import { selectedUniverseIdStore } from "$lib/derived/selected-universe.derived";
import { snsSummariesStore } from "$lib/stores/sns.store";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import { derived, type Readable } from "svelte/store";

/**
 * TODO: integrate ckBTC fee
 * @deprecated to be replaced with tokenStore (Token returned here does not contain fee)
 */
export const snsTokenSymbolSelectedStore: Readable<
  IcrcTokenMetadata | undefined
> = derived(
  [selectedUniverseIdStore, snsSummariesStore],
  ([selectedRootCanisterId, summaries]) => {
    return summaries.find(
      ({ rootCanisterId }) =>
        rootCanisterId.toText() === selectedRootCanisterId.toText()
    )?.token;
  }
);

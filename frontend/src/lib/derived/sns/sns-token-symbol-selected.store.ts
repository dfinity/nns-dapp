import { snsProjectIdSelectedStore } from "$lib/derived/selected-project.derived";
import { snsSummariesStore } from "$lib/stores/sns.store";
import type { Token } from "@dfinity/nns";
import { derived, type Readable } from "svelte/store";

export const snsTokenSymbolSelectedStore: Readable<Token | undefined> = derived(
  [snsProjectIdSelectedStore, snsSummariesStore],
  ([selectedRootCanisterId, summaries]) => {
    const selectedTokenMetadata = summaries.find(
      ({ rootCanisterId }) =>
        rootCanisterId.toText() === selectedRootCanisterId.toText()
    )?.token;
    if (selectedTokenMetadata !== undefined) {
      return {
        symbol: selectedTokenMetadata.symbol,
        name: selectedTokenMetadata.name,
      };
    }
  }
);

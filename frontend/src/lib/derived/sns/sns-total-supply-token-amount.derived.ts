import {
  snsTotalTokenSupplyStore,
  type SnsTotalTokenSupplyStoreData,
} from "$lib/derived/sns-total-token-supply.derived";
import { snsSummariesStore } from "$lib/stores/sns.store";
import type { RootCanisterIdText, SnsSummary } from "$lib/types/sns";
import { nonNullish, TokenAmountV2 } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";

export const snsTotalSupplyTokenAmountStore = derived<
  [Readable<SnsTotalTokenSupplyStoreData>, Readable<SnsSummary[]>],
  Record<RootCanisterIdText, TokenAmountV2>
>(
  [snsTotalTokenSupplyStore, snsSummariesStore],
  ([$snsTotalTokenSupplyStore, $snsSummariesStore]) => {
    return $snsSummariesStore
      .map(({ rootCanisterId, token }) => {
        const totalTokenSupplyStoreEntry =
          $snsTotalTokenSupplyStore[rootCanisterId.toText()];

        return nonNullish(totalTokenSupplyStoreEntry?.totalSupply)
          ? {
              totalSupply: TokenAmountV2.fromUlps({
                amount: totalTokenSupplyStoreEntry?.totalSupply,
                token,
              }),
              rootCanisterId,
            }
          : undefined;
      })
      .reduce<Record<string, TokenAmountV2>>((acc, data) => {
        if (nonNullish(data)) {
          const { totalSupply, rootCanisterId } = data;
          acc[rootCanisterId.toText()] = totalSupply;
        }
        return acc;
      }, {});
  }
);

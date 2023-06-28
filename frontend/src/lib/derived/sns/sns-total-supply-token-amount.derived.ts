import {
  snsTotalTokenSupplyStore,
  type SnsTotalTokenSupplyStoreData,
} from "$lib/stores/sns-total-token-supply.store";
import { snsSummariesStore } from "$lib/stores/sns.store";
import type { RootCanisterIdText, SnsSummary } from "$lib/types/sns";
import { nonNullish, TokenAmount } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";

export const snsTotalSupplyTokenAmountStore = derived<
  [Readable<SnsTotalTokenSupplyStoreData>, Readable<SnsSummary[]>],
  Record<RootCanisterIdText, TokenAmount>
>(
  [snsTotalTokenSupplyStore, snsSummariesStore],
  ([$snsTotalTokenSupplyStore, $snsSummariesStore]) => {
    return $snsSummariesStore
      .map(({ rootCanisterId, token }) => {
        const totalTokenSupplyStoreEntry =
          $snsTotalTokenSupplyStore[rootCanisterId.toText()];

        return nonNullish(totalTokenSupplyStoreEntry?.totalSupply)
          ? {
              totalSupply: TokenAmount.fromE8s({
                amount: totalTokenSupplyStoreEntry?.totalSupply,
                token,
              }),
              rootCanisterId,
            }
          : undefined;
      })
      .reduce<Record<string, TokenAmount>>((acc, data) => {
        if (nonNullish(data)) {
          const { totalSupply, rootCanisterId } = data;
          acc[rootCanisterId.toText()] = totalSupply;
        }
        return acc;
      }, {});
  }
);

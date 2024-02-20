import { snsAggregatorStore } from "$lib/stores/sns-aggregator.store";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import { mapOptionalToken } from "$lib/utils/icrc-tokens.utils";
import { convertIcrc1Metadata } from "$lib/utils/sns-aggregator-converters.utils";
import { isNullish, nonNullish } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";

interface SnsToken {
  rootCanisterId: string;
  ledgerCanisterId: string;
  token: IcrcTokenMetadata;
}

// Helper store for the 2 stores below.
const snsTokensStore: Readable<SnsToken[]> = derived(
  snsAggregatorStore,
  (aggregatorStore) => {
    const aggregatorData = aggregatorStore.data;
    if (isNullish(aggregatorData)) {
      return [];
    }
    return aggregatorData
      .map(
        ({
          icrc1_metadata,
          canister_ids: { root_canister_id, ledger_canister_id },
        }) => ({
          token: mapOptionalToken(convertIcrc1Metadata(icrc1_metadata)),
          rootCanisterId: root_canister_id,
          ledgerCanisterId: ledger_canister_id,
        })
      )
      .filter(({ token }) => nonNullish(token)) as SnsToken[];
  }
);

export const snsTokensByRootCanisterIdStore: Readable<
  Record<string, IcrcTokenMetadata>
> = derived(snsTokensStore, (snsTokens) => {
  return snsTokens.reduce(
    (acc, { rootCanisterId, token }) => ({
      ...acc,
      [rootCanisterId]: token,
    }),
    {}
  );
});

export const snsTokensByLedgerCanisterIdStore: Readable<
  Record<string, IcrcTokenMetadata>
> = derived(snsTokensStore, (snsTokens) => {
  return snsTokens.reduce(
    (acc, { ledgerCanisterId, token }) => ({
      ...acc,
      [ledgerCanisterId]: token,
    }),
    {}
  );
});

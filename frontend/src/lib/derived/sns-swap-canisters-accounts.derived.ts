import {
  snsAggregatorStore,
  type SnsAggregatorStore,
} from "$lib/stores/sns-aggregator.store";
import { getSwapCanisterAccount } from "$lib/utils/sns.utils";
import { Principal } from "@dfinity/principal";
import { isNullish } from "@dfinity/utils";
import { derived } from "svelte/store";

/**
 * Returns a derived store with a list of accounts based on the current swap canister ids.
 *
 * This accounts are used to participate in the swaps. We use this to identify swap participation transactions.
 */
export const createSwapCanisterAccountsStore = (controller?: Principal) =>
  derived<SnsAggregatorStore, Set<string>>(
    snsAggregatorStore,
    ($snsAggregatorStore) =>
      isNullish(controller) || isNullish($snsAggregatorStore.data)
        ? (new Set() as Set<string>)
        : new Set(
            $snsAggregatorStore.data.map(({ canister_ids }) =>
              getSwapCanisterAccount({
                controller,
                swapCanisterId: Principal.fromText(
                  canister_ids.swap_canister_id
                ),
              }).toHex()
            )
          )
  );

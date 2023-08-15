import {
  snsAggregatorStore,
  type SnsAggregatorStore,
} from "$lib/stores/sns-aggregator.store";
import { getSwapCanisterAccount } from "$lib/utils/sns.utils";
import type { AccountIdentifier } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { isNullish } from "@dfinity/utils";
import { derived } from "svelte/store";

export const createSwapCanisterAccountsStore = (controller?: Principal) =>
  derived<SnsAggregatorStore, AccountIdentifier[]>(
    snsAggregatorStore,
    ($snsAggregatorStore) =>
      isNullish(controller) || isNullish($snsAggregatorStore.data)
        ? []
        : $snsAggregatorStore.data.map(({ canister_ids }) =>
            getSwapCanisterAccount({
              controller,
              swapCanisterId: Principal.fromText(canister_ids.swap_canister_id),
            })
          )
  );

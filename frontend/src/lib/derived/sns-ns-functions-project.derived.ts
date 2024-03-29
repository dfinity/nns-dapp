import {
  snsAggregatorStore,
  type SnsAggregatorStore,
} from "$lib/stores/sns-aggregator.store";
import {
  snsFunctionsStore,
  type SnsNervousSystemFunctionsStore,
} from "$lib/stores/sns-functions.store";
import type { CachedSnsDto } from "$lib/types/sns-aggregator";
import { convertNervousFunction } from "$lib/utils/sns-aggregator-converters.utils";
import type { Principal } from "@dfinity/principal";
import type { SnsNervousSystemFunction } from "@dfinity/sns";
import { isNullish, nonNullish } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";

export type SnsNervousSystemFunctionsProjectStore = Readable<
  SnsNervousSystemFunction[] | undefined
>;

export const createSnsNsFunctionsProjectStore = (
  rootCanisterId: Principal | null | undefined
): SnsNervousSystemFunctionsProjectStore =>
  derived<
    [SnsNervousSystemFunctionsStore, SnsAggregatorStore],
    SnsNervousSystemFunction[] | undefined
  >(
    [snsFunctionsStore, snsAggregatorStore],
    ([snsFunctions, aggregatorData]) => {
      if (isNullish(rootCanisterId)) {
        return undefined;
      }
      const rootCanisterIdText = rootCanisterId.toText();
      if (nonNullish(snsFunctions[rootCanisterIdText])) {
        return snsFunctions[rootCanisterIdText].nsFunctions;
      }
      const aggregatorProject: CachedSnsDto | undefined =
        aggregatorData.data?.find(
          ({ canister_ids: { root_canister_id } }) =>
            rootCanisterIdText === root_canister_id
        );
      if (nonNullish(aggregatorProject)) {
        return aggregatorProject.parameters.functions.map(
          convertNervousFunction
        );
      }
      return undefined;
    }
  );

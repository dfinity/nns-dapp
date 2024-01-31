import { selectedUniverseIdStore } from "$lib/derived/selected-universe.derived";
import {
  snsProjectsCommittedStore,
  snsProjectsStore,
  type SnsFullProject,
} from "$lib/derived/sns/sns-projects.derived";
import {
  snsAggregatorStore,
  type SnsAggregatorData,
  type SnsAggregatorStore,
} from "$lib/stores/sns-aggregator.store";
import type { Principal } from "@dfinity/principal";
import { derived, type Readable } from "svelte/store";

/**
 * Returns undefined if the selected project is NNS or ckBTC, otherwise returns the selected project principal.
 */
export const snsOnlyProjectStore = derived<
  [Readable<Principal>, SnsAggregatorStore],
  Principal | undefined
>(
  [selectedUniverseIdStore, snsAggregatorStore],
  ([$selectedUniverseIdStore, snsAggreagatorData]: [
    Principal,
    SnsAggregatorData,
  ]) =>
    snsAggreagatorData.data?.some(
      ({ canister_ids: { root_canister_id } }) =>
        root_canister_id === $selectedUniverseIdStore.toText()
    )
      ? $selectedUniverseIdStore
      : undefined
);

export const snsProjectSelectedStore: Readable<SnsFullProject | undefined> =
  derived(
    [selectedUniverseIdStore, snsProjectsStore],
    ([$selectedUniverseIdStore, $projectsStore]) =>
      $projectsStore.find(
        ({ rootCanisterId }) =>
          rootCanisterId.toText() === $selectedUniverseIdStore.toText()
      )
  );

export const snsCommittedProjectSelectedStore: Readable<
  SnsFullProject | undefined
> = derived(
  [selectedUniverseIdStore, snsProjectsCommittedStore],
  ([$selectedUniverseIdStore, $projectsStore]) =>
    $projectsStore.find(
      ({ rootCanisterId }) =>
        rootCanisterId.toText() === $selectedUniverseIdStore.toText()
    )
);

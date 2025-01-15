import { networkEconomicsStore } from "$lib/stores/network-economics.store";
import { derived, type Readable } from "svelte/store";

export const startReducingVotingPowerAfterSecondsStore: Readable<
  bigint | undefined
> = derived(
  networkEconomicsStore,
  ($networkEconomicsStore) =>
    $networkEconomicsStore.parameters?.votingPowerEconomics
      ?.startReducingVotingPowerAfterSeconds
);

export const clearFollowingAfterSecondsStore: Readable<bigint | undefined> =
  derived(
    networkEconomicsStore,
    ($networkEconomicsStore) =>
      $networkEconomicsStore.parameters?.votingPowerEconomics
        ?.clearFollowingAfterSeconds
  );

import { NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE } from "$lib/constants/neurons.constants";
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

export const neuronMinimumDissolveDelayToVoteSeconds: Readable<bigint> =
  derived(
    networkEconomicsStore,
    ($networkEconomicsStore) =>
      $networkEconomicsStore.parameters?.votingPowerEconomics
        ?.neuronMinimumDissolveDelayToVoteSeconds ??
      BigInt(NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE)
  );

import {
  neuronMinimumDissolveDelayToVoteSeconds,
  startReducingVotingPowerAfterSecondsStore,
} from "$lib/derived/network-economics.derived";
import { neuronsStore } from "$lib/stores/neurons.store";
import {
  hasEnoughDissolveDelayToVote,
  hasValidStake,
  isNeuronMissingRewardsSoon,
  sortNeuronsByStake,
  sortNeuronsByVotingPowerRefreshedTimeout,
} from "$lib/utils/neuron.utils";
import type { NeuronInfo } from "@dfinity/nns";
import { nonNullish } from "@dfinity/utils";
import { derived, get, type Readable } from "svelte/store";

export const definedNeuronsStore: Readable<NeuronInfo[]> = derived(
  neuronsStore,
  ($neuronsStore) => $neuronsStore.neurons?.filter(hasValidStake) || []
);

export const sortedNeuronStore: Readable<NeuronInfo[]> = derived(
  definedNeuronsStore,
  (initializedNeuronsStore) => sortNeuronsByStake(initializedNeuronsStore)
);

export const soonLosingRewardNeuronsStore: Readable<NeuronInfo[]> = derived(
  [definedNeuronsStore, neuronMinimumDissolveDelayToVoteSeconds],
  ([$definedNeuronsStore, $neuronMinimumDissolveDelayToVoteSeconds]) =>
    sortNeuronsByVotingPowerRefreshedTimeout(
      $definedNeuronsStore.filter(
        (neuron) =>
          // Neurons that are not able to vote cannot suddenly miss rewards.
          hasEnoughDissolveDelayToVote(
            neuron,
            $neuronMinimumDissolveDelayToVoteSeconds
          ) &&
          isNeuronMissingRewardsSoon({
            neuron,
            startReducingVotingPowerAfterSeconds: get(
              startReducingVotingPowerAfterSecondsStore
            ),
          })
      )
    )
);

export const neuronAccountsStore: Readable<Set<string>> = derived(
  neuronsStore,
  ($neuronsStore) =>
    new Set(
      $neuronsStore.neurons
        ?.map(({ fullNeuron }) => fullNeuron?.accountIdentifier)
        .filter(nonNullish) || []
    )
);

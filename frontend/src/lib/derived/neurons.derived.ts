import { neuronsStore } from "$lib/stores/neurons.store";
import {
  hasValidStake,
  shouldDisplayRewardLossNotification,
  sortNeuronsByStake,
  sortNeuronsByVotingPowerRefreshedTimeout,
} from "$lib/utils/neuron.utils";
import type { NeuronInfo } from "@dfinity/nns";
import { nonNullish } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";

export const definedNeuronsStore: Readable<NeuronInfo[]> = derived(
  neuronsStore,
  ($neuronsStore) => $neuronsStore.neurons?.filter(hasValidStake) || []
);

export const sortedNeuronStore: Readable<NeuronInfo[]> = derived(
  definedNeuronsStore,
  (initializedNeuronsStore) => sortNeuronsByStake(initializedNeuronsStore)
);

export const soonLosingRewardNeuronsStore: Readable<NeuronInfo[]> = derived(
  definedNeuronsStore,
  ($definedNeuronsStore) =>
    sortNeuronsByVotingPowerRefreshedTimeout(
      $definedNeuronsStore.filter(shouldDisplayRewardLossNotification)
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

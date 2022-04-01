import type { NeuronId, NeuronInfo } from "@dfinity/nns";
import { derived, writable, type Readable } from "svelte/store";
import {
  hasValidStake,
  sortNeuronsByCreatedTimestamp,
} from "../utils/neuron.utils";

export type NeuronsStore = NeuronInfo[];

/**
 * A store that contains the neurons
 *
 * - setNeurons: replace the current list of neurons with a new list
 * - pushNeurons: append neurons to the current list of neurons. Notably useful when staking a new neuron.
 */
const initNeuronsStore = () => {
  const { subscribe, update, set } = writable<NeuronsStore>([]);

  return {
    subscribe,

    setNeurons(neurons: NeuronInfo[]) {
      set([...neurons.filter(hasValidStake)]);
    },

    pushNeurons(newNeurons: NeuronInfo[]) {
      update((oldNeurons: NeuronInfo[]) => {
        const filteredNewNeurons = newNeurons.filter(hasValidStake);
        const newIds = new Set(
          filteredNewNeurons.map(({ neuronId }) => neuronId)
        );
        return [
          ...oldNeurons.filter(({ neuronId }) => !newIds.has(neuronId)),
          ...filteredNewNeurons,
        ];
      });
    },
  };
};

export const neuronsStore = initNeuronsStore();

// source idea: https://svelte.dev/repl/44455916128c40d386927cb72f9a3004?version=3.29.7
const initNeuronSelectStore = () => {
  const _selectedId = writable<NeuronId | undefined>(undefined);
  const _selectedNeuron = derived(
    [neuronsStore, _selectedId],
    ([neurons, selectedId]) =>
      neurons.find((neuron) => neuron.neuronId === selectedId)
  );

  return {
    select: _selectedId.set,
    ..._selectedNeuron,
  };
};

export const neuronSelectStore = initNeuronSelectStore();

export const sortedNeuronStore: Readable<NeuronInfo[]> = derived(
  neuronsStore,
  ($neuronsStore) => sortNeuronsByCreatedTimestamp($neuronsStore)
);

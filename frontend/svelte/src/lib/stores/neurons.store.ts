import type { NeuronId, NeuronInfo } from "@dfinity/nns";
import { derived, writable, type Readable } from "svelte/store";
import {
  hasValidStake,
  sortNeuronsByCreatedTimestamp,
} from "../utils/neuron.utils";

export interface NeuronsStore {
  neurons?: NeuronInfo[];
  // fetched neurons w/o applied hasValidStake filter
  originalNeurons?: NeuronInfo[];
  // certified is an optimistic value - i.e. it represents the last value that has been pushed in store
  certified: boolean | undefined;
}

/**
 * A store that contains the neurons that have a valid stake.
 *
 * - setNeurons: replace the current list of neurons with a new list
 * - pushNeurons: append neurons to the current list of neurons. Notably useful when staking a new neuron.
 */
const initNeuronsStore = () => {
  const { subscribe, update, set } = writable<NeuronsStore>({
    originalNeurons: undefined,
    neurons: undefined,
    certified: undefined,
  });

  return {
    subscribe,

    setNeurons({
      neurons,
      certified,
    }: Required<Omit<NeuronsStore, "originalNeurons">>) {
      set({
        originalNeurons: [...neurons],
        neurons: [...neurons.filter(hasValidStake)],
        certified,
      });
    },

    pushNeurons({
      neurons,
      certified,
    }: Required<Omit<NeuronsStore, "originalNeurons">>) {
      update(({ neurons: oldNeurons, originalNeurons }: NeuronsStore) => {
        const filteredNewNeurons = neurons.filter(hasValidStake);
        const newIds = new Set(
          filteredNewNeurons.map(({ neuronId }) => neuronId)
        );
        return {
          originalNeurons: [
            ...(originalNeurons || []).filter(
              ({ neuronId }) => !newIds.has(neuronId)
            ),
            ...filteredNewNeurons,
          ],
          neurons: [
            ...(oldNeurons || []).filter(
              ({ neuronId }) => !newIds.has(neuronId)
            ),
            ...filteredNewNeurons,
          ],
          certified,
        };
      });
    },
  };
};

export const neuronsStore = initNeuronsStore();

export const definedNeuronsStore: Readable<NeuronInfo[]> = derived(
  neuronsStore,
  ($neuronsStore) => $neuronsStore.neurons || []
);

// source idea: https://svelte.dev/repl/44455916128c40d386927cb72f9a3004?version=3.29.7
const initNeuronSelectStore = () => {
  const _selectedId = writable<NeuronId | undefined>(undefined);
  const _selectedNeuron = derived(
    [definedNeuronsStore, _selectedId],
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
  definedNeuronsStore,
  (initializedNeuronsStore) =>
    sortNeuronsByCreatedTimestamp(initializedNeuronsStore)
);

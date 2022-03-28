import type { NeuronInfo } from "@dfinity/nns";
import { writable } from "svelte/store";
import { hasValidStake } from "../utils/neuron.utils";

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

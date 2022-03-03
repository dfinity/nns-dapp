import type { NeuronInfo } from "@dfinity/nns";
import { writable } from "svelte/store";

/**
 * A store that contains the neurons
 *
 * - setNeurons: replace the current list of neurons with a new list
 * - pushNeurons: append neurons to the current list of neurons. Notably useful when staking a new neuron.
 */
const initNeuronsStore = () => {
  const { subscribe, update, set } = writable<NeuronInfo[]>([]);

  return {
    subscribe,

    setNeurons(neurons: NeuronInfo[]) {
      set([...neurons]);
    },

    pushNeurons(neurons: NeuronInfo[]) {
      update((neuronInfos: NeuronInfo[]) => [...neuronInfos, ...neurons]);
    },
  };
};

export const neuronsStore = initNeuronsStore();

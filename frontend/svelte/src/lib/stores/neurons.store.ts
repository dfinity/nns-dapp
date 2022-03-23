import type { NeuronInfo } from "@dfinity/nns";
import { writable } from "svelte/store";

export type NeuronsStore = NeuronInfo[];

const notInNewList =
  (newNeurons: NeuronInfo[]) =>
  ({ neuronId: oldNeuronId }) =>
    newNeurons.find(
      ({ neuronId: newNeuronId }) => oldNeuronId === newNeuronId
    ) === undefined;

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
      set([...neurons]);
    },

    pushNeurons(newNeurons: NeuronInfo[]) {
      update((oldNeurons: NeuronInfo[]) => {
        const filteredNeurons = oldNeurons.filter(notInNewList(newNeurons));
        return [...filteredNeurons, ...newNeurons];
      });
    },
  };
};

export const neuronsStore = initNeuronsStore();

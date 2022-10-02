import type { KnownNeuron } from "@dfinity/nns";
import { derived, writable } from "svelte/store";

export type KnownNeuronsStore = KnownNeuron[];

/**
 * A store that contains the known neurons
 *
 * - setNeurons: replace the current list of known neurons with a new list
 */
const initKnownNeuronsStore = () => {
  const { subscribe, set } = writable<KnownNeuronsStore>([]);

  return {
    subscribe,

    setNeurons(neurons: KnownNeuron[]) {
      set([...neurons]);
    },
  };
};

export const knownNeuronsStore = initKnownNeuronsStore();

export const sortedknownNeuronsStore = derived(knownNeuronsStore, ($neurons) =>
  $neurons.sort((neuronA, neuronB) => Number(neuronA.id - neuronB.id))
);

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
      set([
        ...neurons,
        // {
        //   id: 858532347504764915n,
        //   name: "Mock Neuron",
        //   description: "This is a mock known neuron",
        //   links: ["https://dfinity.org"],
        //   committed_topics: undefined,
        // },
        // {
        //   id: 7463650834747952490n,
        //   name: "Another Mocked Neuron",
        //   description: "This is another mock known neuron",
        //   links: ["https://dfinity.org/demo/demo-known-neuron"],
        //   committed_topics: undefined,
        // },
      ]);
    },

    reset() {
      set([]);
    },
  };
};

export const knownNeuronsStore = initKnownNeuronsStore();

export const sortedknownNeuronsStore = derived(knownNeuronsStore, ($neurons) =>
  $neurons.sort((neuronA, neuronB) => Number(neuronA.id - neuronB.id))
);

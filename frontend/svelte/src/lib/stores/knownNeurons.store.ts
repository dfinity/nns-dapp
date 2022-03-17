import type { KnownNeuron } from "@dfinity/nns";
import { writable } from "svelte/store";

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

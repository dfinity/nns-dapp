import type { SnsNeuron } from "@dfinity/sns";
import { derived, writable, type Readable } from "svelte/store";
import { sortSnsNeuronsByCreatedTimestamp } from "../utils/sns-neuron.utils";

export interface NeuronsStore {
  neurons?: SnsNeuron[];
  // certified is an optimistic value - i.e. it represents the last value that has been pushed in store
  certified: boolean | undefined;
}

/**
 * A store that contains the sns neurons.
 *
 * - setNeurons: replace the current list of neurons with a new list
 */
const initSnsNeuronsStore = () => {
  const { subscribe, set } = writable<NeuronsStore>({
    neurons: undefined,
    certified: undefined,
  });

  return {
    subscribe,

    setNeurons({ neurons, certified }: Required<NeuronsStore>) {
      set({
        neurons,
        certified,
      });
    },
  };
};

export const snsNeuronsStore = initSnsNeuronsStore();

export const definedSnsNeuronsStore: Readable<SnsNeuron[]> = derived(
  snsNeuronsStore,
  ($neuronsStore) => $neuronsStore.neurons || []
);

export const sortedSnsNeuronStore: Readable<SnsNeuron[]> = derived(
  definedSnsNeuronsStore,
  (neurons) => sortSnsNeuronsByCreatedTimestamp(neurons)
);

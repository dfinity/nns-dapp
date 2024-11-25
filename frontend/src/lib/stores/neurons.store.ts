import type { NeuronInfo } from "@dfinity/nns";
import { writable } from "svelte/store";

export interface NeuronsStore {
  neurons?: NeuronInfo[];
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

    pushNeurons({ neurons, certified }: Required<NeuronsStore>) {
      update(({ neurons: oldNeurons }: NeuronsStore) => {
        const newIds = new Set(neurons.map(({ neuronId }) => neuronId));
        return {
          neurons: [
            ...(oldNeurons || []).filter(
              ({ neuronId }) => !newIds.has(neuronId)
            ),
            ...neurons,
          ],
          certified,
        };
      });
    },

    replaceNeurons(neurons: NeuronInfo[]) {
      // the function should preserve the order to avoid jumps in the lists
      update(({ neurons: oldNeurons, certified }: NeuronsStore) => {
        const newNeurons = new Map(
          neurons.map((neuron) => [neuron.neuronId, neuron])
        );
        const updatedNeurons = oldNeurons?.map((old) => {
          const { neuronId } = old;
          const newNeuron = newNeurons.get(neuronId);

          if (newNeuron) {
            newNeurons.delete(neuronId);
          }

          return newNeuron ?? old;
        });

        return {
          neurons: [
            ...Array.from(updatedNeurons?.values() ?? []),
            ...Array.from(newNeurons.values()),
          ],
          certified,
        };
      });
    },

    reset() {
      set({
        neurons: undefined,
        certified: undefined,
      });
    },
  };
};

export const neuronsStore = initNeuronsStore();

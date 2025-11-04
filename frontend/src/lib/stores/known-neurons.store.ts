import { KNOWN_NEURONS_ORDER_DASHBOARD } from "$lib/constants/neurons.constants";
import type { KnownNeuron } from "@dfinity/nns";
import { nonNullish } from "@dfinity/utils";
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

    reset() {
      set([]);
    },
  };
};

export const knownNeuronsStore = initKnownNeuronsStore();

// Precompute index lookup for the pinned order on the dashboard
const KNOWN_NEURON_ORDER_INDEX: Map<string, number> = new Map(
  KNOWN_NEURONS_ORDER_DASHBOARD.map((id, index) => [id, index])
);

export const sortedknownNeuronsStore = derived(
  knownNeuronsStore,
  ($neurons) => {
    const getOrderIndex = (id: bigint): number | undefined =>
      KNOWN_NEURON_ORDER_INDEX.get(id.toString());

    return $neurons.toSorted((a: KnownNeuron, b: KnownNeuron) => {
      const aIndex = getOrderIndex(a.id);
      const bIndex = getOrderIndex(b.id);

      // 1. sort by known order
      if (nonNullish(aIndex) && nonNullish(bIndex)) return aIndex - bIndex;
      if (nonNullish(aIndex)) return -1;
      if (nonNullish(bIndex)) return 1;

      // 2. sort by name alphabetically
      const aName = a.name.toLocaleLowerCase();
      const bName = b.name.toLocaleLowerCase();
      if (aName < bName) return -1;
      if (aName > bName) return 1;

      return 0;
    });
  }
);

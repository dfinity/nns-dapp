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

// The `listKnownNeuron` endpoint does not return the creation timestamp,
// so we rely on this hardcoded variable to avoid calling `getNeuronInfo`
// for each neuron.
// This approach is acceptable since this list does not change frequently.
export const sortedknownNeuronsStore = derived(
  knownNeuronsStore,
  ($neurons) => {
    const byId = new Map($neurons.map((n) => [n.id.toString(), n]));

    // 1) Pinned neurons in the order defined by the constant (safe mapping)
    const pinnedNeurons: KnownNeuron[] = KNOWN_NEURONS_ORDER_DASHBOARD.map(
      (id) => byId.get(id)
    ).filter(nonNullish);

    if (pinnedNeurons.length === $neurons.length) return pinnedNeurons;

    // 2) Append remaining neurons alphabetically by name with stable id tie-break
    const pinnedPresentIdSet = new Set(
      pinnedNeurons.map((n) => n.id.toString())
    );

    const remainingNeurons = $neurons.filter(
      (n) => !pinnedPresentIdSet.has(n.id.toString())
    );
    const remainingSorted = remainingNeurons.toSorted(
      (a: KnownNeuron, b: KnownNeuron) => {
        const byName = a.name.localeCompare(b.name, undefined, {
          sensitivity: "base",
        });
        if (byName !== 0) return byName;
        return Number(a.id - b.id);
      }
    );

    return [...pinnedNeurons, ...remainingSorted];
  }
);

import type { Principal } from "@dfinity/principal";
import type { SnsNeuron } from "@dfinity/sns";
import type { Readable } from "svelte/store";

/**
 * A store that contains the selected sns neuron.
 *
 * `null` is the initial value.
 * `undefined` means not found
 */
export interface SelectedSnsNeuronStore {
  selected:
    | {
        rootCanisterId: Principal;
        neuronIdHex: string;
      }
    | undefined;
  neuron: SnsNeuron | undefined | null;
}

export interface SelectedSnsNeuronContext {
  store: Readable<SelectedSnsNeuronStore>;
  reload: () => Promise<void>;
}

export const SELECTED_SNS_NEURON_CONTEXT_KEY = Symbol("selected-sns-neuron");

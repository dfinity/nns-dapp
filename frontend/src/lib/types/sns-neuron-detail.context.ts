import type { SnsNeuron } from "@icp-sdk/canisters/sns";
import type { Principal } from "@icp-sdk/core/principal";
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

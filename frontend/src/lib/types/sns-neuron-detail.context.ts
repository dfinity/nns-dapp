import type { Principal } from "@dfinity/principal";
import type { SnsNeuron } from "@dfinity/sns";
import type { Writable } from "svelte/store";

/**
 * A store that contains the selected proposal.
 */
export interface SelectedSnsNeuronStore {
  rootCanisterId: Principal | undefined;
  neuronIdHex: string | undefined;
  neuron: SnsNeuron | undefined;
}

export interface SelectedSnsNeuronContext {
  store: Writable<SelectedSnsNeuronStore>;
  reload: () => Promise<void>;
}

export const SELECTED_SNS_NEURON_CONTEXT_KEY = Symbol("selected-sns-neuron");

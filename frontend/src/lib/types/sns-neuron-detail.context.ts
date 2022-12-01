import type { Principal } from "@dfinity/principal";
import type { SnsNeuron } from "@dfinity/sns";
import type { Writable } from "svelte/store";

export type SnsNeuronModal =
  | "increase-dissolve-delay"
  | "disburse"
  | "dissolve"
  | "follow"
  | "add-hotkey";

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
  modal: SnsNeuronModal | undefined;
}

export interface SelectedSnsNeuronContext {
  store: Writable<SelectedSnsNeuronStore>;
  reload: () => Promise<void>;
  toggleModal: (modal: SnsNeuronModal | undefined) => void;
}

export const SELECTED_SNS_NEURON_CONTEXT_KEY = Symbol("selected-sns-neuron");

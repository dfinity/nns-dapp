import type { NeuronInfo } from "@dfinity/nns";
import type { Writable } from "svelte/store";

export type NnsNeuronModal =
  | "increase-dissolve-delay"
  | "disburse"
  | "dissolve"
  | "follow"
  | "add-hotkey"
  | "split-neuron"
  | "increase-stake"
  | "auto-stake-maturity"
  | "stake-maturity"
  | "merge-maturity"
  | "spawn"
  | "join-community-fund";

export interface NnsNeuronStore {
  neuron: NeuronInfo | undefined;
  modal: NnsNeuronModal | undefined;
}

export interface NnsNeuronContext {
  store: Writable<NnsNeuronStore>;
  toggleModal: (modal: NnsNeuronModal | undefined) => void;
}

export const NNS_NEURON_CONTEXT_KEY = Symbol("nns-neuron");

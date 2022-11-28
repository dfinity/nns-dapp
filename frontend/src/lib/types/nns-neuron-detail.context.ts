import type { NeuronInfo } from "@dfinity/nns";
import type { Writable } from "svelte/store";

export type NnsNeuronModal =
  | "increase-dissolve-delay"
  | "split-neuron"
  | "increase-stake"
  | "disburse"
  | "dissolve"
  | "auto-stake-maturity"
  | "stake-maturity"
  | "merge-maturity"
  | "spawn"
  | "join-community-fund"
  | "follow"
  | undefined;

export interface NnsNeuronStore {
  neuron: NeuronInfo;
  modal: NnsNeuronModal;
}

export interface NnsNeuronContext {
  store: Writable<NnsNeuronStore>;
  toggleModal: (modal: NnsNeuronModal) => void;
}

export const NNS_NEURON_CONTEXT_KEY = Symbol("nns-neuron");

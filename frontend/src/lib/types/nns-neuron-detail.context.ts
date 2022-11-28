import type { NeuronInfo } from "@dfinity/nns";
import type { Writable } from "svelte/store";

export type NeuronModal = "increase-dissolve-delay"
    | "disburse"
    | "dissolve" | undefined;

export type NnsNeuronModal = NeuronModal &
  (
    | "split-neuron"
    | "increase-stake"
    | "auto-stake-maturity"
    | "stake-maturity"
    | "merge-maturity"
    | "spawn"
    | "join-community-fund"
    | "follow"
    | "add-hotkey"
  );

export interface NnsNeuronStore {
  neuron: NeuronInfo | undefined;
  modal: NnsNeuronModal;
}

export interface NnsNeuronContext {
  store: Writable<NnsNeuronStore>;
  toggleModal: (modal: NnsNeuronModal) => void;
}

export const NNS_NEURON_CONTEXT_KEY = Symbol("nns-neuron");

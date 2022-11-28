import type { NeuronInfo } from "@dfinity/nns";
import type { Writable } from "svelte/store";

export type NnsNeuronModal = "increase-dissolve-delay" | undefined;

export interface NnsNeuronStore {
  neuron: NeuronInfo;
  modal: NnsNeuronModal;
}

export interface NnsNeuronContext {
  store: Writable<NnsNeuronStore>;
}

export const NNS_NEURON_CONTEXT_KEY = Symbol("nns-neuron");

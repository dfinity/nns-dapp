import type { NeuronInfo } from "@dfinity/nns";
import type { Writable } from "svelte/store";

export interface NnsNeuronStore {
  neuron: NeuronInfo | undefined;
}

export interface NnsNeuronContext {
  store: Writable<NnsNeuronStore>;
}

export const NNS_NEURON_CONTEXT_KEY = Symbol("nns-neuron");

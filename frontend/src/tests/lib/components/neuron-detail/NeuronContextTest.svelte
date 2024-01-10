<script lang="ts">
  import { setContext, SvelteComponent } from "svelte";
  import { writable } from "svelte/store";
  import type {
    NnsNeuronContext,
    NnsNeuronStore,
  } from "$lib/types/nns-neuron-detail.context";
  import type { NeuronInfo } from "@dfinity/nns";
  import NnsNeuronModals from "$lib/modals/neurons/NnsNeuronModals.svelte";
  import { NNS_NEURON_CONTEXT_KEY } from "$lib/types/nns-neuron-detail.context";

  export let testComponent: typeof SvelteComponent;
  export let neuron: NeuronInfo | undefined;
  export let componentProps: Record<string, unknown> = {};

  export const neuronStore = writable<NnsNeuronStore>({
    neuron,
  });

  setContext<NnsNeuronContext>(NNS_NEURON_CONTEXT_KEY, {
    store: neuronStore,
  });
</script>

<svelte:component this={testComponent} {...componentProps} />

<NnsNeuronModals />

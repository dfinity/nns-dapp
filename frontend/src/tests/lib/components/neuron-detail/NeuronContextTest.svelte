<script lang="ts">
  import { setContext, SvelteComponent } from "svelte";
  import { writable } from "svelte/store";
  import type {NnsNeuronContext, NnsNeuronStore} from "$lib/types/nns-neuron-detail.context";
  import {NNS_NEURON_CONTEXT_KEY, NnsNeuronModal} from "$lib/types/nns-neuron-detail.context";
  import type {NeuronInfo} from "@dfinity/nns";
  import NnsNeuronModals from "$lib/modals/neurons/NnsNeuronModals.svelte";

  export let testComponent: typeof SvelteComponent;
  export let neuron: NeuronInfo | undefined;

  export const neuronStore = writable<NnsNeuronStore>({
    modal: undefined,
    neuron
  });

  const toggleModal = (modal: NnsNeuronModal) =>
          neuronStore.update((data) => ({ ...data, modal }));

  setContext<NnsNeuronContext>(NNS_NEURON_CONTEXT_KEY, {
    store: neuronStore,
    toggleModal
  });
</script>

<svelte:component this={testComponent} />

<NnsNeuronModals />

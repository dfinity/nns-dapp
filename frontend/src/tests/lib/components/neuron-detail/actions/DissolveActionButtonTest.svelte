<script lang="ts">
  import { setContext } from "svelte";
  import { writable } from "svelte/store";
  import type {
    NnsNeuronContext,
    NnsNeuronStore,
  } from "$lib/types/nns-neuron-detail.context";
  import {
    NNS_NEURON_CONTEXT_KEY,
    NnsNeuronModal,
  } from "$lib/types/nns-neuron-detail.context";
  import type { NeuronInfo } from "@dfinity/nns";
  import NnsNeuronModals from "$lib/modals/neurons/NnsNeuronModals.svelte";
  import DissolveActionButton from "$lib/components/neuron-detail/actions/DissolveActionButton.svelte";

  export let neuron: NeuronInfo | undefined;

  export const neuronStore = writable<NnsNeuronStore>({
    modal: undefined,
    neuron,
    selectedFollowee: undefined,
  });

  const toggleModal = (modal: NnsNeuronModal) =>
    neuronStore.update((data) => ({ ...data, modal }));

  setContext<NnsNeuronContext>(NNS_NEURON_CONTEXT_KEY, {
    store: neuronStore,
    toggleModal,
  });
</script>

<DissolveActionButton neuronState={neuron.state} />

<NnsNeuronModals />

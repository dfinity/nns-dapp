<script lang="ts">
  import { writable } from "svelte/store";
  import type {
    NnsNeuronContext,
    NnsNeuronStore,
  } from "$lib/types/nns-neuron-detail.context";
  import type { NeuronInfo } from "@dfinity/nns";
  import NnsNeuronModals from "$lib/modals/neurons/NnsNeuronModals.svelte";
  import DissolveActionButton from "$lib/components/neuron-detail/actions/DissolveActionButton.svelte";
  import { setContext } from "svelte";
  import { NNS_NEURON_CONTEXT_KEY } from "$lib/types/nns-neuron-detail.context";

  export let neuron: NeuronInfo | undefined;

  export const neuronStore = writable<NnsNeuronStore>({
    neuron,
  });

  setContext<NnsNeuronContext>(NNS_NEURON_CONTEXT_KEY, {
    store: neuronStore,
  });
</script>

<DissolveActionButton neuronState={neuron.state} />

<NnsNeuronModals />

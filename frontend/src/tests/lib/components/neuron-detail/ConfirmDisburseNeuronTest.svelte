<script lang="ts">
  import ConfirmDisburseNeuron from "$lib/components/neuron-detail/ConfirmDisburseNeuron.svelte";
  import NnsNeuronModals from "$lib/modals/neurons/NnsNeuronModals.svelte";
  import type {
    NnsNeuronContext,
    NnsNeuronStore,
  } from "$lib/types/nns-neuron-detail.context";
  import { NNS_NEURON_CONTEXT_KEY } from "$lib/types/nns-neuron-detail.context";
  import type { NeuronInfo } from "@dfinity/nns";
  import { setContext } from "svelte";
  import { writable } from "svelte/store";

  export let neuron: NeuronInfo | undefined;
  export let props: unknown;

  export const neuronStore = writable<NnsNeuronStore>({
    neuron,
  });

  setContext<NnsNeuronContext>(NNS_NEURON_CONTEXT_KEY, {
    store: neuronStore,
  });
</script>

<ConfirmDisburseNeuron {...props} />

<NnsNeuronModals />

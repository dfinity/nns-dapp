<script lang="ts">
  import NnsNeuronModals from "$lib/modals/neurons/NnsNeuronModals.svelte";
  import type {
    NnsNeuronContext,
    NnsNeuronStore,
  } from "$lib/types/nns-neuron-detail.context";
  import { NNS_NEURON_CONTEXT_KEY } from "$lib/types/nns-neuron-detail.context";
  import type { NeuronInfo } from "@dfinity/nns";
  import { setContext } from "svelte";
  import { writable } from "svelte/store";
  import NnsNeuronRewardStatusAction from "$lib/components/neuron-detail/NnsNeuronRewardStatusAction.svelte";

  export let neuron: NeuronInfo;

  export const neuronStore = writable<NnsNeuronStore>({
    neuron,
  });

  setContext<NnsNeuronContext>(NNS_NEURON_CONTEXT_KEY, {
    store: neuronStore,
  });
</script>

<NnsNeuronRewardStatusAction {neuron} />

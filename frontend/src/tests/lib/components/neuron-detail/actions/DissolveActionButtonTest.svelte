<script lang="ts">
  import { writable } from "svelte/store";
  import type { NnsNeuronStore } from "$lib/types/nns-neuron-detail.context";
  import type { NeuronInfo } from "@dfinity/nns";
  import NnsNeuronModals from "$lib/modals/neurons/NnsNeuronModals.svelte";
  import DissolveActionButton from "$lib/components/neuron-detail/actions/DissolveActionButton.svelte";

  export let neuron: NeuronInfo | undefined;

  export const neuronStore = writable<NnsNeuronStore>({
    neuron,
  });
</script>

<DissolveActionButton neuronState={neuron.state} />

<NnsNeuronModals />

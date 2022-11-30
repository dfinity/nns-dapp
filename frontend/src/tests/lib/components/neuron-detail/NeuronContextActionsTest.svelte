<script lang="ts">
  import { SvelteComponent } from "svelte";
  import { writable } from "svelte/store";
  import type { NnsNeuronStore } from "$lib/types/nns-neuron-detail.context";
  import type { NeuronInfo } from "@dfinity/nns";
  import NnsNeuronModals from "$lib/modals/neurons/NnsNeuronModals.svelte";

  export let testComponent: typeof SvelteComponent;
  export let neuron: NeuronInfo | undefined;

  export const neuronStore = writable<NnsNeuronStore>({
    neuron,
  });
</script>

<svelte:component this={testComponent} {neuron} />

<NnsNeuronModals />

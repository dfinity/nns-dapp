<script lang="ts">
  import NnsNeuronModals from "$lib/modals/neurons/NnsNeuronModals.svelte";
  import type {
    NnsNeuronContext,
    NnsNeuronStore,
  } from "$lib/types/nns-neuron-detail.context";
  import { NNS_NEURON_CONTEXT_KEY } from "$lib/types/nns-neuron-detail.context";
  import type { NeuronInfo } from "@dfinity/nns";
  import { type Component, setContext } from "svelte";
  import { writable } from "svelte/store";

  type Props = {
    TestComponent: Component;
    neuron?: NeuronInfo;
    componentProps?: Record<string, unknown>;
  };
  const { TestComponent, neuron, componentProps = {} }: Props = $props();

  export const neuronStore = writable<NnsNeuronStore>({
    neuron,
  });

  setContext<NnsNeuronContext>(NNS_NEURON_CONTEXT_KEY, {
    store: neuronStore,
  });
</script>

<TestComponent {neuron} {...componentProps} />

<NnsNeuronModals />

<script lang="ts">
  import IncreaseDissolveDelayModal from "$lib/modals/neurons/IncreaseDissolveDelayModal.svelte";
  import {
    NNS_NEURON_CONTEXT_KEY,
    type NnsNeuronContext,
    type NnsNeuronModal,
  } from "$lib/types/nns-neuron-detail.context";
  import { getContext } from "svelte";
  import type { NeuronInfo } from "@dfinity/nns";

  const context: NnsNeuronContext = getContext<NnsNeuronContext>(
    NNS_NEURON_CONTEXT_KEY
  );
  const { store }: NnsNeuronContext = context;

  let modal: NnsNeuronModal;
  let neuron: NeuronInfo | undefined;
  $: ({ neuron, modal } = $store);

  const close = () => store.update((data) => ({ ...data, modal: undefined }));
</script>

{#if modal === "increase-dissolve-delay" && neuron !== undefined}
  <IncreaseDissolveDelayModal {neuron} on:nnsClose={close} />
{/if}

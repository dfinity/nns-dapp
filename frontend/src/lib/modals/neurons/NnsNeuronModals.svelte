<script lang="ts">
  import IncreaseDissolveDelayModal from "$lib/modals/neurons/IncreaseDissolveDelayModal.svelte";
  import SplitNeuronModal from "$lib/modals/neurons/SplitNeuronModal.svelte";
  import {
    NNS_NEURON_CONTEXT_KEY,
    type NnsNeuronContext,
    type NnsNeuronModal,
  } from "$lib/types/nns-neuron-detail.context";
  import { getContext } from "svelte";
  import type { NeuronInfo } from "@dfinity/nns";
  import IncreaseNeuronStakeModal from "$lib/modals/neurons/IncreaseNeuronStakeModal.svelte";
  import DisburseNnsNeuronModal from "$lib/modals/neurons/DisburseNnsNeuronModal.svelte";
  import DissolveActionButtonModal from "$lib/modals/neurons/DissolveActionButtonModal.svelte";

  const context: NnsNeuronContext = getContext<NnsNeuronContext>(
    NNS_NEURON_CONTEXT_KEY
  );
  const { store }: NnsNeuronContext = context;

  let modal: NnsNeuronModal;
  let neuron: NeuronInfo | undefined;
  $: ({ neuron, modal } = $store);

  const close = () => store.update((data) => ({ ...data, modal: undefined }));
</script>

{#if neuron !== undefined}
  {#if modal === "increase-dissolve-delay"}
    <IncreaseDissolveDelayModal {neuron} on:nnsClose={close} />
  {/if}

  {#if modal === "split-neuron"}
    <SplitNeuronModal {neuron} on:nnsClose={close} />
  {/if}

  {#if modal === "increase-stake"}
    <IncreaseNeuronStakeModal {neuron} on:nnsClose={close} />
  {/if}

  {#if modal === "disburse"}
    <DisburseNnsNeuronModal {neuron} on:nnsClose={close} />
  {/if}

  {#if modal === "dissolve"}
    <DissolveActionButtonModal {neuron} on:nnsClose={close} />
  {/if}
{/if}

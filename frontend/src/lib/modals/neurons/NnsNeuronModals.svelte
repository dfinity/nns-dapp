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
  import AutoStakeMaturityModal from "$lib/modals/neurons/AutoStakeMaturityModal.svelte";
  import StakeMaturityModal from "$lib/modals/neurons/StakeMaturityModal.svelte";
  import MergeMaturityModal from "$lib/modals/neurons/MergeMaturityModal.svelte";
  import SpawnNeuronModal from "$lib/modals/neurons/SpawnNeuronModal.svelte";

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

  {#if modal === "stake-maturity"}
    <StakeMaturityModal on:nnsClose={close} {neuron} />
  {/if}

  {#if modal === "merge-maturity"}
    <MergeMaturityModal on:nnsClose={close} {neuron} />
  {/if}

  {#if modal === "spawn"}
    <SpawnNeuronModal on:nnsClose={close} {neuron} />
  {/if}

  {#if modal === "auto-stake-maturity"}
    <AutoStakeMaturityModal on:nnsClose={close} {neuron} />
  {/if}
{/if}

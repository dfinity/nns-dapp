<script lang="ts">
  import { i18n } from "../../../stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import type { SvelteComponent } from "svelte";
  import type { SnsNeuron } from "@dfinity/sns";

  export let neuron: NeuronInfo | SnsNeuron;
  export let modal: typeof SvelteComponent;
  export let reloadContext: ((params: { forceFetch: boolean }) => Promise<void>) | undefined = undefined;

  let showModal = false;
  const openModal = () => (showModal = true);
  const closeModal = () => (showModal = false);
</script>

<button class="warning" on:click={openModal} data-tid="disburse-button"
  >{$i18n.neuron_detail.disburse}</button
>

{#if showModal}
  <svelte:component
    this={modal}
    {neuron}
    {reloadContext}
    on:nnsClose={closeModal}
  />
{/if}

<script lang="ts">
  import { i18n } from "../../../stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import type { SvelteComponent } from "svelte";
  import type { SnsNeuron } from "@dfinity/sns";

  export let neuron: NeuronInfo | SnsNeuron;
  export let modal: typeof SvelteComponent;

  let showModal: boolean = false;
  const openModal = () => (showModal = true);
  const closeModal = () => (showModal = false);
</script>

<button class="warning small" on:click={openModal} data-tid="disburse-button"
  >{$i18n.neuron_detail.disburse}</button
>

{#if showModal}
  <svelte:component this={modal} {neuron} on:nnsClose={closeModal} />
{/if}

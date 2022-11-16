<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import DisburseNnsNeuronModal from "$lib/modals/neurons/DisburseNnsNeuronModal.svelte";

  export let neuron: NeuronInfo;

  let showModal = false;
  const openModal = () => (showModal = true);
  const closeModal = () => (showModal = false);
</script>

<button class="secondary" on:click={openModal} data-tid="disburse-button"
  >{$i18n.neuron_detail.disburse}</button
>

{#if showModal}
  <DisburseNnsNeuronModal {neuron} on:nnsClose={closeModal} />
{/if}

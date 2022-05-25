<script lang="ts">
  import { i18n } from "../../../stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import DisburseNeuronModal from "../../../modals/neurons/DisburseNeuronModal.svelte";

  export let neuron: NeuronInfo;

  let showModal: boolean = false;
  const openModal = () => (showModal = true);
  const closeModal = () => (showModal = false);
</script>

<button class="warning small" on:click={openModal} data-tid="disburse-button"
  >{$i18n.neuron_detail.disburse}</button
>

{#if showModal}
  <DisburseNeuronModal on:nnsClose={closeModal} {neuron} />
{/if}

<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import SplitNeuronModal from "../../../modals/neurons/SplitNeuronModal.svelte";
  import { i18n } from "../../../stores/i18n";

  export let neuron: NeuronInfo;

  let isOpen: boolean = false;

  const openModal = () => (isOpen = true);
  const closeModal = () => (isOpen = false);
</script>

<button class="primary small" on:click={openModal}
  >{$i18n.neuron_detail.split_neuron}</button
>

{#if isOpen}
  <SplitNeuronModal {neuron} on:nnsClose={closeModal} />
{/if}

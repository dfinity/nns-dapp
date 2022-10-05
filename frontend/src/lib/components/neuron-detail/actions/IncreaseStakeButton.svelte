<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import IncreaseNeuronStakeModal from "$lib/modals/neurons/IncreaseNeuronStakeModal.svelte";

  export let neuron: NeuronInfo;

  let showModal = false;
  const openModal = () => (showModal = true);
  const closeModal = () => (showModal = false);
</script>

<button class="primary" on:click={openModal}
  >{$i18n.neuron_detail.increase_stake}</button
>

{#if showModal}
  <IncreaseNeuronStakeModal {neuron} on:nnsClose={closeModal} />
{/if}

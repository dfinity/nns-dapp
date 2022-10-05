<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import StakeMaturityModal from "$lib/components/modals/neurons/StakeMaturityModal.svelte";

  export let neuron: NeuronInfo;

  let isOpen = false;
  const showModal = () => (isOpen = true);
  const closeModal = () => (isOpen = false);
</script>

<button class="primary" on:click={showModal} data-tid="stake-maturity-button"
  >{$i18n.neuron_detail.stake_maturity}</button
>

{#if isOpen}
  <StakeMaturityModal on:nnsClose={closeModal} {neuron} />
{/if}

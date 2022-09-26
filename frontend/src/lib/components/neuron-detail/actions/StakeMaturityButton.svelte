<script lang="ts">
  import { i18n } from "../../../stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import MergeMaturityModal from "../../../modals/neurons/MergeMaturityModal.svelte";

  export let neuron: NeuronInfo;

  let isOpen: boolean = false;
  const showModal = () => (isOpen = true);
  const closeModal = () => (isOpen = false);
</script>

<button class="primary" on:click={showModal}
  >{$i18n.neuron_detail.stake_maturity}</button
>

{#if isOpen}
  <MergeMaturityModal on:nnsClose={closeModal} {neuron} />
{/if}

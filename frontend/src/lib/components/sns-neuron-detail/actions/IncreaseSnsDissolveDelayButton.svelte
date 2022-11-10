<script lang="ts">
  import IncreaseSnsDissolveDelayModal from "$lib/modals/sns/IncreaseSnsDissolveDelayModal.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { SnsNeuron } from "@dfinity/sns";

  export let neuron: SnsNeuron;

  let showModal = false;
  const openModal = () => (showModal = true);
  const closeModal = () => (showModal = false);
</script>

<button class="primary" on:click={openModal}
  >{$i18n.neuron_detail.increase_dissolve_delay}</button
>

{#if showModal}
  <IncreaseSnsDissolveDelayModal {neuron} on:nnsClose={closeModal} />
{/if}

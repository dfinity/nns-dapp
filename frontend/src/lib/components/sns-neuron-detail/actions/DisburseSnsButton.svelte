<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { SnsNeuron } from "@dfinity/sns";
  import DisburseSnsNeuronModal from "$lib/modals/neurons/DisburseSnsNeuronModal.svelte";
  import type { Principal } from "@dfinity/principal";

  export let rootCanisterId: Principal;
  export let neuron: SnsNeuron;
  export let reloadContext: () => Promise<void>;

  let showModal = false;
  const openModal = () => (showModal = true);
  const closeModal = () => (showModal = false);
</script>

<button class="secondary" on:click={openModal} data-tid="disburse-button"
  >{$i18n.neuron_detail.disburse}</button
>

{#if showModal}
  <DisburseSnsNeuronModal
    {rootCanisterId}
    {neuron}
    {reloadContext}
    on:nnsClose={closeModal}
  />
{/if}

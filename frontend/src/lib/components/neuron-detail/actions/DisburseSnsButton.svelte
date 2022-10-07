<script lang="ts">
  import { i18n } from "../../../stores/i18n";
  import type { SnsNeuron } from "@dfinity/sns";
  import DisburseSnsNeuronModal from "../../../modals/neurons/DisburseSnsNeuronModal.svelte";

  export let neuron: SnsNeuron;
  export let reloadContext: () => Promise<void>;

  let showModal: boolean = false;
  const openModal = () => (showModal = true);
  const closeModal = () => (showModal = false);
</script>

<button class="warning" on:click={openModal} data-tid="disburse-button"
  >{$i18n.neuron_detail.disburse}</button
>

{#if showModal}
  <DisburseSnsNeuronModal {neuron} {reloadContext} on:nnsClose={closeModal} />
{/if}

<script lang="ts">
  import IncreaseDissolveDelayModal from "../../../modals/neurons/IncreaseDissolveDelayModal.svelte";
  import { i18n } from "../../../stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";

  export let neuron: NeuronInfo;

  let showModal: boolean = false;
  const openModal = () => (showModal = true);
  const closeModal = () => (showModal = false);
</script>

<button class="primary small" on:click={openModal}
  >{$i18n.neuron_detail.increase_dissolve_delay}</button
>

{#if showModal}
  <IncreaseDissolveDelayModal {neuron} on:nnsClose={closeModal} />
{/if}

<script lang="ts">
  import type { NeuronId } from "@dfinity/nns";
  import AddHotkeyModal from "$lib/modals/neurons/AddHotkeyModal.svelte";
  import { i18n } from "$lib/stores/i18n";

  export let neuronId: NeuronId;

  let isOpen = false;

  const showModal = () => (isOpen = true);
  const closeModal = () => (isOpen = false);
</script>

<button data-tid="add-hotkey-button" class="primary" on:click={showModal}
  >{$i18n.neuron_detail.add_hotkey}</button
>

{#if isOpen}
  <AddHotkeyModal {neuronId} on:nnsClose={closeModal} />
{/if}

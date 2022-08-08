<script lang="ts">
  import type { SnsNeuronId } from "@dfinity/sns";
  import AddSnsHotkeyModal from "../../../modals/sns/AddSnsHotkeyModal.svelte";

  import { i18n } from "../../../stores/i18n";

  export let neuronId: SnsNeuronId;

  let showModal: boolean = false;
  const openModal = () => (showModal = true);
  const closeModal = () => (showModal = false);
</script>

<button data-tid="add-hotkey-button" class="primary small" on:click={openModal}
  >{$i18n.neuron_detail.add_hotkey}</button
>

{#if showModal}
  <AddSnsHotkeyModal {neuronId} on:nnsClose={closeModal} />
{/if}

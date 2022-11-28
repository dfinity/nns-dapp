<script lang="ts">
  import AddSnsHotkeyModal from "$lib/modals/sns/neurons/AddSnsHotkeyModal.svelte";

  import { i18n } from "$lib/stores/i18n";

  let showModal = false;
  const openModal = () => (showModal = true);
  const closeModal = () => (showModal = false);
</script>

<button data-tid="add-hotkey-button" class="primary" on:click={openModal}
  >{$i18n.neuron_detail.add_hotkey}</button
>

{#if showModal}
  <AddSnsHotkeyModal on:nnsClose={closeModal} />
{/if}

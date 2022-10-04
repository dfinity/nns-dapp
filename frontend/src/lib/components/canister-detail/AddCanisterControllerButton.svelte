<script lang="ts">
  import AddControllerModal from "$lib/modals/canisters/AddControllerModal.svelte";
  import { i18n } from "$lib/stores/i18n";

  let showModal: boolean = false;
  const openModal = () => (showModal = true);
  const close = () => (showModal = false);
</script>

<button
  data-tid="add-canister-controller-button"
  on:click={openModal}
  class="primary">{$i18n.canister_detail.add_controller}</button
>

{#if showModal}
  <AddControllerModal on:nnsClose={close} />
{/if}

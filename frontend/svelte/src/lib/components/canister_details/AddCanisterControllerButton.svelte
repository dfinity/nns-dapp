<script lang="ts">
  import type { Principal } from "@dfinity/principal";
  import AddControllerModal from "../../modals/canisters/AddControllerModal.svelte";
  import { i18n } from "../../stores/i18n";

  export let canisterId: Principal;

  let showModal: boolean = false;
  const openModal = () => (showModal = true);
  const close = () => (showModal = false);
</script>

<button
  data-tid="add-canister-controller-button"
  on:click={openModal}
  class="primary small">{$i18n.canister_detail.add_controller}</button
>

{#if showModal}
  <AddControllerModal {canisterId} on:nnsClose={close} />
{/if}

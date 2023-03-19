<script lang="ts">
  import { accountsStore } from "$lib/stores/accounts.store";
  import { i18n } from "$lib/stores/i18n";
  import AddAccountModal from "$lib/modals/accounts/AddAccountModal.svelte";
  import { nonNullish } from "@dfinity/utils";
  import { IconAdd } from "@dfinity/gix-components";

  let modal: "AddAccountModal" | undefined = undefined;
  const openAddAccountModal = () => (modal = "AddAccountModal");
  const closeModal = () => (modal = undefined);
</script>

{#if modal === "AddAccountModal"}
  <AddAccountModal on:nnsClose={closeModal} />
{/if}

{#if nonNullish($accountsStore)}
  <button
    class="card"
    on:click={openAddAccountModal}
    data-tid="open-add-account-modal"
  >
    <IconAdd />
    {$i18n.accounts.add_account}
  </button>
{/if}

<script lang="ts">
  import { accountsStore } from "$lib/stores/accounts.store";
  import { i18n } from "$lib/stores/i18n";
  import AddAccountModal from "$lib/modals/accounts/AddAccountModal.svelte";
  import Footer from "$lib/components/layout/Footer.svelte";
  import IcpTransactionModal from "$lib/modals/accounts/IcpTransactionModal.svelte";
  import { nonNullish } from "@dfinity/utils";

  let modal: "NewTransaction" | undefined = undefined;
  const openNewTransaction = () => (modal = "NewTransaction");
  const closeModal = () => (modal = undefined);
</script>

{#if modal === "AddAccountModal"}
  <AddAccountModal on:nnsClose={closeModal} />
{/if}
{#if modal === "NewTransaction"}
  <IcpTransactionModal on:nnsClose={closeModal} />
{/if}

{#if nonNullish($accountsStore)}
  <Footer columns={1}>
    <button
      class="primary full-width"
      on:click={openNewTransaction}
      data-tid="open-new-transaction">{$i18n.accounts.send}</button
    >
  </Footer>
{/if}

<script lang="ts">
  import { accountsStore } from "$lib/stores/accounts.store";
  import { i18n } from "$lib/stores/i18n";
  import AddAccountModal from "$lib/modals/accounts/AddAccountModal.svelte";
  import Footer from "$lib/components/common/Footer.svelte";
  import IcpTransactionModal from "$lib/modals/accounts/IcpTransactionModal.svelte";
  import { nonNullish } from "$lib/utils/utils";

  let modal: "AddAccountModal" | "NewTransaction" | undefined = undefined;
  const openAddAccountModal = () => (modal = "AddAccountModal");
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
  <Footer>
    <button
      class="primary full-width"
      on:click={openNewTransaction}
      data-tid="open-new-transaction">{$i18n.accounts.new_transaction}</button
    >
    <button
      class="secondary full-width"
      on:click={openAddAccountModal}
      data-tid="open-add-account-modal">{$i18n.accounts.add_account}</button
    >
  </Footer>
{/if}

<script lang="ts">
  import { onDestroy } from "svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { accountsStore } from "$lib/stores/accounts.store";
  import type { AccountsStore } from "$lib/stores/accounts.store";
  import { i18n } from "$lib/stores/i18n";
  import AddAcountModal from "$lib/modals/accounts/AddAccountModal.svelte";
  import Footer from "$lib/components/common/Footer.svelte";
  import IcpTransactionModal from "$lib/modals/accounts/IcpTransactionModal.svelte";

  let accounts: AccountsStore | undefined;

  const unsubscribe: Unsubscriber = accountsStore.subscribe(
    async (storeData: AccountsStore) => (accounts = storeData)
  );

  onDestroy(unsubscribe);

  let modal: "AddAccountModal" | "NewTransaction" | undefined = undefined;
  const openAddAccountModal = () => (modal = "AddAccountModal");
  const openNewTransaction = () => (modal = "NewTransaction");
  const closeModal = () => (modal = undefined);
</script>

{#if modal === "AddAccountModal"}
  <AddAcountModal on:nnsClose={closeModal} />
{/if}
{#if modal === "NewTransaction"}
  <IcpTransactionModal on:nnsClose={closeModal} />
{/if}

{#if accounts !== undefined}
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

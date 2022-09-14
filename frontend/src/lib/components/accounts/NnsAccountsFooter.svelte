<script lang="ts">
  import { onDestroy } from "svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { accountsStore } from "../../stores/accounts.store";
  import type { AccountsStore } from "../../stores/accounts.store";
  import { i18n } from "../../stores/i18n";
  import { Toolbar } from "@dfinity/gix-components";
  import AddAcountModal from "../../modals/accounts/AddAccountModal.svelte";
  import NewTransactionModal from "../../modals/accounts/NewTransactionModal.svelte";
  import Footer from "../common/Footer.svelte";

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
  <NewTransactionModal on:nnsClose={closeModal} />
{/if}

{#if accounts}
  <Footer>
    <Toolbar>
      <button
        class="primary full-width"
        on:click={openNewTransaction}
        data-tid="open-new-transaction">{$i18n.accounts.new_transaction}</button
      >
      <button
        class="primary full-width"
        on:click={openAddAccountModal}
        data-tid="open-add-account-modal">{$i18n.accounts.add_account}</button
      >
    </Toolbar>
  </Footer>
{/if}

<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import Footer from "../common/Footer.svelte";
  import { snsProjectAccountsStore } from "$lib/derived/sns/sns-project-accounts.derived";
  import SnsTransactionModal from "$lib/modals/accounts/SnsTransactionModal.svelte";

  // TODO: Support adding subaccounts
  let modal: "NewTransaction" | undefined = undefined;
  const openNewTransaction = () => (modal = "NewTransaction");
  const closeModal = () => (modal = undefined);
</script>

{#if modal === "NewTransaction"}
  <SnsTransactionModal on:nnsClose={closeModal} />
{/if}

{#if $snsProjectAccountsStore !== undefined}
  <Footer columns={1}>
    <button
      class="primary full-width"
      on:click={openNewTransaction}
      data-tid="open-new-sns-transaction"
      >{$i18n.accounts.new_transaction}</button
    >
  </Footer>
{/if}

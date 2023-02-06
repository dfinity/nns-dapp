<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import Footer from "$lib/components/layout/Footer.svelte";
  import { nonNullish } from "$lib/utils/utils";
  import { ckBTCAccountsStore } from "$lib/stores/ckbtc-accounts.store";
  import { ckBTCTokenFeeStore } from "$lib/derived/universes-tokens.derived";
  import CkBTCTransactionModal from "$lib/modals/accounts/CkBTCTransactionModal.svelte";
  import { hasAccounts } from "$lib/utils/accounts.utils";

  let modal: "NewTransaction" | undefined = undefined;
  const openNewTransaction = () => (modal = "NewTransaction");
  const closeModal = () => (modal = undefined);

  let canMakeTransactions = false;
  $: canMakeTransactions =
    hasAccounts($ckBTCAccountsStore.accounts) &&
    nonNullish($ckBTCTokenFeeStore);
</script>

{#if modal === "NewTransaction"}
  <CkBTCTransactionModal on:nnsClose={closeModal} />
{/if}

{#if canMakeTransactions}
  <Footer columns={1}>
    <button
      class="primary full-width"
      on:click={openNewTransaction}
      data-tid="open-ckbtc-transaction">{$i18n.accounts.new_transaction}</button
    >
  </Footer>
{/if}

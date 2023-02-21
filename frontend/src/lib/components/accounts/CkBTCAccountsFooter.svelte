<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import Footer from "$lib/components/layout/Footer.svelte";
  import { nonNullish } from "@dfinity/utils";
  import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
  import {
    ckBTCTokenFeeStore,
    ckBTCTokenStore,
  } from "$lib/derived/universes-tokens.derived";
  import CkBTCTransactionModal from "$lib/modals/accounts/CkBTCTransactionModal.svelte";
  import { hasAccounts } from "$lib/utils/accounts.utils";
  import { selectedCkBTCUniverseIdStore } from "$lib/derived/ckbtc-universes.derived";

  let modal: "NewTransaction" | undefined = undefined;
  const openNewTransaction = () => (modal = "NewTransaction");
  const closeModal = () => (modal = undefined);

  let canMakeTransactions = false;
  $: canMakeTransactions =
    nonNullish($selectedCkBTCUniverseIdStore) &&
    hasAccounts($icrcAccountsStore[$selectedCkBTCUniverseIdStore].accounts) &&
    nonNullish($ckBTCTokenFeeStore[$selectedCkBTCUniverseIdStore]) &&
    nonNullish($ckBTCTokenStore[$selectedCkBTCUniverseIdStore]);
</script>

{#if modal === "NewTransaction" && nonNullish($ckBTCTokenStore[$selectedCkBTCUniverseIdStore]) && nonNullish($ckBTCTokenFeeStore[$selectedCkBTCUniverseIdStore])}
  <CkBTCTransactionModal
    on:nnsClose={closeModal}
    on:nnsTransfer={closeModal}
    token={$ckBTCTokenStore[$selectedCkBTCUniverseIdStore].token}
    transactionFee={$ckBTCTokenFeeStore[$selectedCkBTCUniverseIdStore]}
  />
{/if}

{#if canMakeTransactions}
  <Footer columns={1}>
    <button
      class="primary full-width"
      on:click={openNewTransaction}
      data-tid="open-ckbtc-transaction">{$i18n.accounts.send}</button
    >
  </Footer>
{/if}

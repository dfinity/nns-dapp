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
  import type { TokensStoreUniverseData } from "$lib/stores/tokens.store";
  import type { TokenAmount } from "@dfinity/nns";

  let modal: "NewTransaction" | undefined = undefined;
  const openNewTransaction = () => (modal = "NewTransaction");
  const closeModal = () => (modal = undefined);

  let canMakeTransactions = false;
  $: canMakeTransactions =
    nonNullish($selectedCkBTCUniverseIdStore) &&
    hasAccounts(
      $icrcAccountsStore[$selectedCkBTCUniverseIdStore.toText()].accounts
    ) &&
    nonNullish($ckBTCTokenFeeStore[$selectedCkBTCUniverseIdStore.toText()]) &&
    nonNullish($ckBTCTokenStore[$selectedCkBTCUniverseIdStore.toText()]);

  let token: TokensStoreUniverseData | undefined = undefined;
  $: token = nonNullish($selectedCkBTCUniverseIdStore)
    ? $ckBTCTokenStore[$selectedCkBTCUniverseIdStore.toText()]
    : undefined;

  let transactionFee: TokenAmount | undefined = undefined;
  $: transactionFee = nonNullish($selectedCkBTCUniverseIdStore)
    ? $ckBTCTokenFeeStore[$selectedCkBTCUniverseIdStore.toText()]
    : undefined;
</script>

{#if modal === "NewTransaction" && nonNullish($selectedCkBTCUniverseIdStore) && nonNullish(token) && nonNullish(transactionFee)}
  <CkBTCTransactionModal
    on:nnsClose={closeModal}
    on:nnsTransfer={closeModal}
    token={token.token}
    {transactionFee}
    universeId={$selectedCkBTCUniverseIdStore}
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

<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import Footer from "$lib/components/layout/Footer.svelte";
  import { snsProjectAccountsStore } from "$lib/derived/sns/sns-project-accounts.derived";
  import SnsTransactionModal from "$lib/modals/accounts/SnsTransactionModal.svelte";
  import ReceiveButton from "$lib/components/accounts/ReceiveButton.svelte";
  import { syncSnsAccounts } from "$lib/services/sns-accounts.services";
  import { TokenAmountV2, isNullish, nonNullish } from "@dfinity/utils";
  import { snsOnlyProjectStore } from "$lib/derived/sns/sns-selected-project.derived";
  import { toastsError } from "$lib/stores/toasts.store";
  import {
    selectedUniverseIdStore,
    selectedUniverseStore,
  } from "$lib/derived/selected-universe.derived";
  import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
  import { snsSelectedTransactionFeeStore } from "$lib/derived/sns/sns-selected-transaction-fee.store";
  import IC_LOGO from "$lib/assets/icp.svg";
  import { toTokenAmountV2 } from "$lib/utils/token.utils";

  // TODO: Support adding subaccounts
  let modal: "NewTransaction" | undefined = undefined;
  const openNewTransaction = () => (modal = "NewTransaction");
  const closeModal = () => (modal = undefined);

  const reload = async () => {
    if (isNullish($snsOnlyProjectStore)) {
      toastsError({
        labelKey: "error__sns.sns_reload_no_universe",
      });
      return;
    }

    await syncSnsAccounts({ rootCanisterId: $snsOnlyProjectStore });
  };

  let transactionFee: TokenAmountV2 | undefined = undefined;
  $: transactionFee = nonNullish($snsSelectedTransactionFeeStore)
    ? toTokenAmountV2($snsSelectedTransactionFeeStore)
    : undefined;
</script>

{#if modal === "NewTransaction"}
  <SnsTransactionModal
    rootCanisterId={$selectedUniverseIdStore}
    token={$snsTokenSymbolSelectedStore}
    {transactionFee}
    on:nnsClose={closeModal}
  />
{/if}

{#if nonNullish($snsProjectAccountsStore)}
  <Footer>
    <button
      class="primary full-width"
      on:click={openNewTransaction}
      data-tid="open-new-sns-transaction">{$i18n.accounts.send}</button
    >

    <ReceiveButton
      type="icrc-receive"
      canSelectAccount
      testId="receive-sns"
      {reload}
      universeId={$snsOnlyProjectStore}
      logo={$selectedUniverseStore?.summary?.metadata.logo ?? IC_LOGO}
      tokenSymbol={$selectedUniverseStore?.summary?.token.symbol}
    />
  </Footer>
{/if}

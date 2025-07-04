<script lang="ts">
  import SignInGuard from "$lib/components/common/SignInGuard.svelte";
  import TransactionDescription from "$lib/components/transaction/TransactionDescription.svelte";
  import TransactionSource from "$lib/components/transaction/TransactionSource.svelte";
  import TransactionSummary from "$lib/components/transaction/TransactionSummary.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type {
    NewTransaction,
    TransactionNetwork,
  } from "$lib/types/transaction";
  import { busy } from "@dfinity/gix-components";
  import type { Token, TokenAmount, TokenAmountV2 } from "@dfinity/utils";
  import { createEventDispatcher, type Snippet } from "svelte";

  type Props = {
    additionalInfo: Snippet;
    description: Snippet;
    destinationInfo: Snippet;
    disableSubmit: boolean;
    handleGoBack: () => void;
    receivedAmount: Snippet;
    selectedNetwork?: TransactionNetwork;
    showLedgerFee?: boolean;
    token: Token;
    transaction: NewTransaction;
    transactionFee: TokenAmountV2 | TokenAmount;
  };

  const {
    additionalInfo,
    description,
    destinationInfo,
    disableSubmit,
    handleGoBack,
    receivedAmount,
    selectedNetwork = undefined,
    showLedgerFee = true,
    token,
    transaction,
    transactionFee,
  }: Props = $props();

  const { sourceAccount, amount, destinationAddress } = $derived(transaction);

  const dispatcher = createEventDispatcher();
  const submit = () => {
    dispatcher("nnsSubmit", transaction);
  };
</script>

<div data-tid="transaction-step-2">
  <div class="info">
    <TransactionSource account={sourceAccount} {token} />

    <TransactionSummary
      {amount}
      {token}
      {transactionFee}
      {showLedgerFee}
      {receivedAmount}
    />

    <TransactionDescription
      {selectedNetwork}
      {destinationAddress}
      {description}
      {destinationInfo}
    />

    {@render additionalInfo()}
  </div>

  <div class="toolbar">
    <button
      class="secondary"
      data-tid="transaction-button-back"
      onclick={handleGoBack}>{$i18n.accounts.edit_transaction}</button
    >
    <SignInGuard>
      <button
        class="primary"
        data-tid="transaction-button-execute"
        disabled={$busy || disableSubmit}
        onclick={submit}>{$i18n.accounts.send_now}</button
      >
    </SignInGuard>
  </div>
</div>

<style lang="scss">
  .info {
    display: flex;
    flex-direction: column;
    gap: var(--padding-0_5x);
  }

  .toolbar {
    margin: var(--padding-2x) 0 0;
  }
</style>

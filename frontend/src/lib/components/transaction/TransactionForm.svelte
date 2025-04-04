<script lang="ts">
  import SelectDestinationAddress from "$lib/components/accounts/SelectDestinationAddress.svelte";
  import TransactionFormFee from "$lib/components/transaction/TransactionFormFee.svelte";
  import TransactionFormItemNetwork from "$lib/components/transaction/TransactionFormItemNetwork.svelte";
  import TransactionFromAccount from "$lib/components/transaction/TransactionFromAccount.svelte";
  import AmountInput from "$lib/components/ui/AmountInput.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import { NotEnoughAmountError } from "$lib/types/common.errors";
  import { InvalidAmountError } from "$lib/types/neurons.errors";
  import type {
    TransactionNetwork,
    TransactionSelectDestinationMethods,
    ValidateAmountFn,
  } from "$lib/types/transaction";
  import {
    assertEnoughAccountFunds,
    invalidAddress,
    isAccountHardwareWallet,
  } from "$lib/utils/accounts.utils";
  import { translate } from "$lib/utils/i18n.utils";
  import {
    getMaxTransactionAmount,
    toTokenAmountV2,
  } from "$lib/utils/token.utils";
  import type { Principal } from "@dfinity/principal";
  import {
    isNullish,
    TokenAmount,
    TokenAmountV2,
    type Token,
  } from "@dfinity/utils";
  import { createEventDispatcher } from "svelte";

  // Tested in the TransactionModal
  export let rootCanisterId: Principal;
  export let selectedAccount: Account | undefined = undefined;
  export let canSelectDestination: boolean;
  export let canSelectSource: boolean;
  export let selectedDestinationAddress: string | undefined = undefined;
  export let amount: number | undefined = undefined;
  export let disableContinue = false;
  export let token: Token;
  export let transactionFee: TokenAmountV2 | TokenAmount;
  // TODO: Handle min and max validations inline: https://dfinity.atlassian.net/browse/L2-798
  export let maxAmount: bigint | undefined = undefined;
  export let skipHardwareWallets = false;
  export let showManualAddress = true;
  export let selectDestinationMethods: TransactionSelectDestinationMethods =
    "all";
  export let showLedgerFee = true;

  export let mustSelectNetwork = false;
  export let selectedNetwork: TransactionNetwork | undefined = undefined;
  export let networkReadonly: boolean | undefined = undefined;

  export let validateAmount: ValidateAmountFn = () => undefined;

  let filterSourceAccounts: (account: Account) => boolean;
  $: filterSourceAccounts = (account: Account) => {
    return !skipHardwareWallets || !isAccountHardwareWallet(account);
  };

  let filterDestinationAccounts: (account: Account) => boolean;
  $: filterDestinationAccounts = (account: Account) => {
    return account.identifier !== selectedAccount?.identifier;
  };

  let max = 0;
  $: max = getMaxTransactionAmount({
    balance: selectedAccount?.balanceUlps,
    fee: toTokenAmountV2(transactionFee).toUlps(),
    maxAmount,
    token,
  });
  const addMax = () => (amount = max);

  let disableButton: boolean;
  $: disableButton =
    disableContinue ||
    selectedAccount === undefined ||
    amount === 0 ||
    amount === undefined ||
    invalidAddress({
      address: selectedDestinationAddress,
      network: selectedNetwork,
      rootCanisterId,
    }) ||
    errorMessage !== undefined ||
    (mustSelectNetwork && isNullish(selectedNetwork));

  let errorMessage: string | undefined = undefined;
  $: (() => {
    // Remove error message when resetting amount or source account
    if (amount === undefined || selectedAccount === undefined) {
      errorMessage = undefined;
      return;
    }
    try {
      const tokens = TokenAmountV2.fromNumber({ amount, token });
      assertEnoughAccountFunds({
        account: selectedAccount,
        amountUlps: tokens.toUlps() + toTokenAmountV2(transactionFee).toUlps(),
      });
      errorMessage = validateAmount({ amount, selectedAccount });
    } catch (error: unknown) {
      if (error instanceof NotEnoughAmountError) {
        errorMessage = $i18n.error.insufficient_funds;
        return;
      }
      if (error instanceof InvalidAmountError) {
        errorMessage = $i18n.error.amount_not_valid;
        return;
      }
      if (error instanceof Error) {
        errorMessage = translate({ labelKey: error.message });
      }
    }
  })();
  const dispatcher = createEventDispatcher();
  const close = () => {
    dispatcher("nnsClose");
  };

  const goNext = () => {
    dispatcher("nnsNext");
  };

  let balance: bigint | undefined;
  $: balance = selectedAccount?.balanceUlps;

  // TODO(GIX-1332): if destination address is selected, select corresponding network
  // TODO: if network changes, reset destination address or display error?
</script>

<form on:submit|preventDefault={goNext} data-tid="transaction-step-1">
  <TransactionFromAccount
    bind:selectedAccount
    {canSelectSource}
    {rootCanisterId}
    filterAccounts={filterSourceAccounts}
  />

  {#if canSelectDestination}
    <SelectDestinationAddress
      {rootCanisterId}
      filterAccounts={filterDestinationAccounts}
      bind:selectedDestinationAddress
      bind:showManualAddress
      bind:selectMethods={selectDestinationMethods}
      {selectedNetwork}
      on:nnsOpenQRCodeReader
    />
  {/if}

  {#if mustSelectNetwork}
    <TransactionFormItemNetwork
      bind:selectedNetwork
      universeId={rootCanisterId}
      {selectedDestinationAddress}
      {networkReadonly}
    />
  {/if}

  <div class="amount">
    <AmountInput
      bind:amount
      on:nnsMax={addMax}
      {max}
      {errorMessage}
      {token}
      {balance}
    />

    {#if showLedgerFee}
      <TransactionFormFee {transactionFee} />
    {/if}

    <slot name="additional-info" />
  </div>

  <div class="toolbar">
    <button
      class="secondary"
      data-tid="transaction-button-cancel"
      type="button"
      on:click={close}>{$i18n.core.cancel}</button
    >
    <button
      class="primary"
      data-tid="transaction-button-next"
      disabled={disableButton}
      type="submit">{$i18n.core.continue}</button
    >
  </div>
</form>

<style lang="scss">
  form {
    --dropdown-width: 100%;
    gap: var(--padding-2x);
  }

  .amount {
    display: flex;
    flex-direction: column;
    gap: var(--padding);

    margin-top: var(--padding);
    --input-error-wrapper-padding: 0 0 var(--padding-2x);
  }
</style>

<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import FooterModal from "$lib/modals/FooterModal.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import { InvalidAmountError } from "$lib/types/neurons.errors";
  import {
    assertEnoughAccountFunds,
    invalidAddress,
    isAccountHardwareWallet,
  } from "$lib/utils/accounts.utils";
  import { getMaxTransactionAmount } from "$lib/utils/icp.utils";
  import SelectAccountDropdown from "$lib/components/accounts/SelectAccountDropdown.svelte";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import AmountInput from "$lib/components/ui/AmountInput.svelte";
  import KeyValuePair from "$lib/components/ui/KeyValuePair.svelte";
  import SelectDestinationAddress from "$lib/components/accounts/SelectDestinationAddress.svelte";
  import { TokenAmount, type Token } from "@dfinity/nns";

  // Tested in the TransactionModal
  export let selectedAccount: Account | undefined = undefined;
  export let canSelectDestination: boolean;
  export let canSelectSource: boolean;
  export let selectedDestinationAddress: string | undefined = undefined;
  export let amount: number | undefined = undefined;
  export let token: Token;
  export let transactionFee: TokenAmount;
  // TODO: Handle min and max validations inline: https://dfinity.atlassian.net/browse/L2-798
  export let maxAmount: bigint | undefined = undefined;
  export let skipHardwareWallets = false;
  export let showManualAddress = true;

  let filterDestinationAccounts: (account: Account) => boolean;
  $: filterDestinationAccounts = (account: Account) => {
    return (
      account.identifier !== selectedAccount?.identifier ||
      (skipHardwareWallets && isAccountHardwareWallet(account))
    );
  };

  let max = 0;
  $: max = getMaxTransactionAmount({
    balance: selectedAccount?.balance.toE8s(),
    fee: transactionFee.toE8s(),
    maxAmount,
  });
  const addMax = () => (amount = max);

  let disableButton: boolean;
  $: disableButton =
    selectedAccount === undefined ||
    amount === 0 ||
    amount === undefined ||
    invalidAddress(selectedDestinationAddress) ||
    errorMessage !== undefined;

  let errorMessage: string | undefined = undefined;
  $: (() => {
    // Remove error message when resetting amount or source account
    if (amount === undefined || selectedAccount === undefined) {
      errorMessage = undefined;
      return;
    }
    try {
      const tokens = TokenAmount.fromNumber({ amount, token });
      assertEnoughAccountFunds({
        account: selectedAccount,
        amountE8s: tokens.toE8s() + transactionFee.toE8s(),
      });
      errorMessage = undefined;
    } catch (error: unknown) {
      if (error instanceof InvalidAmountError) {
        errorMessage = $i18n.error.amount_not_valid;
      }
      errorMessage = $i18n.error.insufficient_funds;
    }
  })();
  const dispatcher = createEventDispatcher();
  const close = () => {
    dispatcher("nnsClose");
  };

  const goNext = () => {
    dispatcher("nnsNext");
  };
</script>

<form
  on:submit|preventDefault={goNext}
  data-tid="transaction-step-1"
>
  <div class="select-account">
    {#if selectedAccount !== undefined}
      <KeyValuePair>
        <span slot="key" class="label">{$i18n.accounts.source}</span>
        <AmountDisplay
          slot="value"
          singleLine
          amount={selectedAccount?.balance}
        />
      </KeyValuePair>
    {/if}
    {#if canSelectSource}
      <SelectAccountDropdown bind:selectedAccount />
    {:else}
      <div>
        <p>
          {selectedAccount?.name ?? $i18n.accounts.main}
        </p>
        <p class="account-identifier">
          {selectedAccount?.identifier}
        </p>
      </div>
    {/if}
  </div>
  <div class="wrapper">
    <AmountInput bind:amount on:nnsMax={addMax} {max} {errorMessage} />
    <slot name="additional-info" />
  </div>
  {#if canSelectDestination}
    <SelectDestinationAddress
      filterAccounts={filterDestinationAccounts}
      bind:selectedDestinationAddress
      bind:showManualAddress
    />
  {/if}

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
      type="submit">{$i18n.accounts.review_action}</button
    >
  </div>
</form>

<style lang="scss">
  @use "../../../themes/mixins/modal";

  form {
    --dropdown-width: 100%;
  }

  .select-account {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    gap: var(--padding-3x);
  }

  .account-identifier {
    word-break: break-all;
  }
</style>

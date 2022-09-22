<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import FooterModal from "../../../modals/FooterModal.svelte";
  import { i18n } from "../../../stores/i18n";
  import {
    mainTransactionFeeStoreAsIcp,
    transactionsFeesStore,
  } from "../../../stores/transaction-fees.store";
  import type { Account } from "../../../types/account";
  import { InvalidAmountError } from "../../../types/neurons.errors";
  import {
    assertEnoughAccountFunds,
    invalidAddress,
    isAccountHardwareWallet,
  } from "../../../utils/accounts.utils";
  import {
    convertNumberToICP,
    getMaxTransactionAmount,
  } from "../../../utils/icp.utils";
  import SelectAccountDropdown from "../../../components/accounts/SelectAccountDropdown.svelte";
  import AmountDisplay from "../../../components/ic/AmountDisplay.svelte";
  import AmountInput from "../../../components/ui/AmountInput.svelte";
  import KeyValuePair from "../../../components/ui/KeyValuePair.svelte";
  import SelectDestinationAddress from "../../../components/accounts/SelectDestinationAddress.svelte";

  // Tested in the TransactionModal
  export let selectedAccount: Account | undefined = undefined;
  export let canSelectDestination: boolean;
  export let canSelectSource: boolean;
  export let selectedDestinationAddress: string | undefined = undefined;
  export let amount: number | undefined = undefined;
  // TODO: Handle min and max validations inline: https://dfinity.atlassian.net/browse/L2-798
  export let maxAmount: bigint | undefined = undefined;
  export let skipHardwareWallets: boolean = false;
  export let showManualAddress: boolean = true;

  let filterDestinationAccounts: (account: Account) => boolean;
  $: filterDestinationAccounts = (account: Account) => {
    return (
      account.identifier !== selectedAccount?.identifier ||
      (skipHardwareWallets && isAccountHardwareWallet(account))
    );
  };

  let max: number = 0;
  $: max = getMaxTransactionAmount({
    balance: selectedAccount?.balance.toE8s(),
    fee: $transactionsFeesStore.main,
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
      const icp = convertNumberToICP(amount);
      assertEnoughAccountFunds({
        account: selectedAccount,
        amountE8s: icp.toE8s() + $mainTransactionFeeStoreAsIcp.toE8s(),
      });
      errorMessage = undefined;
    } catch (error) {
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
  class="wrapper"
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
        <p class="label">
          {selectedAccount?.name ?? $i18n.accounts.main}
        </p>
        <p class="account-identifier">
          {selectedAccount?.identifier}
        </p>
      </div>
    {/if}
  </div>
  <div class="wrapper info">
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

  <FooterModal>
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
  </FooterModal>
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

    &.info {
      gap: var(--padding-2x);
    }
  }

  .account-identifier {
    word-break: break-all;
  }
</style>

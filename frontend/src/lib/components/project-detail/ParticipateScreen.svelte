<script lang="ts">
  import type { ICP } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import FooterModal from "../../modals/FooterModal.svelte";
  import { i18n } from "../../stores/i18n";
  import {
    mainTransactionFeeStoreAsIcp,
    mainTransactionFeeStore,
  } from "../../stores/transaction-fees.store";
  import type { Account } from "../../types/account";
  import { InvalidAmountError } from "../../types/neurons.errors";
  import { assertEnoughAccountFunds } from "../../utils/accounts.utils";
  import { convertNumberToICP, maxICP } from "../../utils/icp.utils";
  import SelectAccountDropdown from "../accounts/SelectAccountDropdown.svelte";
  import IcpComponent from "../ic/ICP.svelte";
  import AmountInput from "../ui/AmountInput.svelte";
  import KeyValuePair from "../ui/KeyValuePair.svelte";

  // Tested in the ParticipateSwapModal

  export let selectedAccount: Account | undefined = undefined;
  export let amount: number | undefined = undefined;
  // TODO: Handle min and max validations inline: https://dfinity.atlassian.net/browse/L2-798
  export let minAmount: ICP;
  export let maxAmount: ICP;
  export let increasingParticipation: boolean = false;

  let max: number = 0;
  $: max = maxICP({
    icp: selectedAccount?.balance,
    fee: $mainTransactionFeeStore,
  });
  const addMax = () => (amount = max);

  let disableButton: boolean;
  $: disableButton =
    selectedAccount === undefined ||
    amount === 0 ||
    amount === undefined ||
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
  data-tid="sns-swap-participate-step-1"
>
  <div class="select-account">
    {#if selectedAccount !== undefined}
      <KeyValuePair>
        <span slot="key">{$i18n.accounts.source}</span>
        <IcpComponent slot="value" singleLine icp={selectedAccount?.balance} />
      </KeyValuePair>
    {/if}
    <SelectAccountDropdown bind:selectedAccount skipHardwareWallets />
  </div>
  <div class="wrapper info">
    <AmountInput bind:amount on:nnsMax={addMax} {max} {errorMessage} />
    {#if increasingParticipation}
      <p class="right">
        {$i18n.sns_project_detail.max_left}
        <IcpComponent singleLine icp={maxAmount} />
      </p>
    {:else}
      <KeyValuePair>
        <span slot="key"
          >{$i18n.core.min} <IcpComponent singleLine icp={minAmount} /></span
        >
        <span slot="value"
          >{$i18n.core.max} <IcpComponent singleLine icp={maxAmount} /></span
        >
      </KeyValuePair>
    {/if}
    <p class="right">
      <span>{$i18n.accounts.transaction_fee}</span>
      <IcpComponent singleLine icp={$mainTransactionFeeStoreAsIcp} />
    </p>
  </div>
  <FooterModal>
    <button
      class="small secondary"
      data-tid="sns-swap-participate-button-cancel"
      type="button"
      on:click={close}>{$i18n.core.cancel}</button
    >
    <button
      class="small primary"
      data-tid="sns-swap-participate-button-next"
      disabled={disableButton}
      type="submit">{$i18n.sns_project_detail.participate}</button
    >
  </FooterModal>
</form>

<style lang="scss">
  @use "../../themes/mixins/modal";

  .select-account {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
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

  p {
    margin: 0;
  }

  .right {
    text-align: right;
  }
</style>

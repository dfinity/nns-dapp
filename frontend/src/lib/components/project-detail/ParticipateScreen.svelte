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
  import { maxICP } from "../../utils/icp.utils";
  import SelectAccountDropdown from "../accounts/SelectAccountDropdown.svelte";
  import IcpComponent from "../ic/ICP.svelte";
  import AmountInput from "../ui/AmountInput.svelte";
  import KeyValuePair from "../ui/KeyValuePair.svelte";

  // Tested in the ParticipateSwapModal

  export let selectedAccount: Account | undefined = undefined;
  export let amount: number | undefined = undefined;
  // TODO: Handle min and max validations: https://dfinity.atlassian.net/browse/L2-798
  export let minAmount: ICP;
  export let maxAmount: ICP;

  let max: number = 0;
  $: max = maxICP({
    icp: selectedAccount?.balance,
    fee: $mainTransactionFeeStore,
  });
  const addMax = () => (amount = max);

  let disableButton: boolean;
  $: disableButton =
    selectedAccount === undefined || amount === 0 || amount === undefined;

  const dispatcher = createEventDispatcher();
  const close = () => {
    dispatcher("nnsClose");
  };

  const goNext = () => {
    dispatcher("nnsNext");
  };
</script>

<div class="wrapper" data-tid="sns-swap-participate-step-1">
  <div class="select-account">
    {#if selectedAccount !== undefined}
      <KeyValuePair>
        <span slot="key">Source</span>
        <IcpComponent slot="value" singleLine icp={selectedAccount?.balance} />
      </KeyValuePair>
    {/if}
    <SelectAccountDropdown bind:selectedAccount skipHardwareWallets />
  </div>
  <div class="wrapper info">
    <AmountInput bind:amount on:nnsMax={addMax} {max} />
    <KeyValuePair>
      <span slot="key"
        >{$i18n.core.min} <IcpComponent singleLine icp={minAmount} /></span
      >
      <span slot="value"
        >{$i18n.core.max} <IcpComponent singleLine icp={maxAmount} /></span
      >
    </KeyValuePair>
    <p class="right">
      <span>{$i18n.accounts.transaction_fee}</span>
      <IcpComponent singleLine icp={$mainTransactionFeeStoreAsIcp} />
    </p>
  </div>
  <FooterModal>
    <button
      class="small secondary"
      data-tid="sns-swap-participate-button-cancel"
      on:click={close}>{$i18n.core.cancel}</button
    >
    <button
      class="small primary"
      data-tid="sns-swap-participate-button-next"
      disabled={disableButton}
      on:click={goNext}>{$i18n.sns_project_detail.participate}</button
    >
  </FooterModal>
</div>

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

<script lang="ts">
  import TransactionFormFee from "$lib/components/transaction/TransactionFormFee.svelte";
  import TransactionFromAccount from "$lib/components/transaction/TransactionFromAccount.svelte";
  import AmountInput from "$lib/components/ui/AmountInput.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import {
    mainTransactionFeeE8sStore,
    mainTransactionFeeStoreAsToken,
  } from "$lib/derived/main-transaction-fee.derived";
  import { loadBalance } from "$lib/services/icp-accounts.services";
  import { stakeNeuron } from "$lib/services/neurons.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { ENABLE_NEURON_VISIBILITY } from "$lib/stores/feature-flags.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsError } from "$lib/stores/toasts.store";
  import type { Account } from "$lib/types/account";
  import { isAccountHardwareWallet } from "$lib/utils/accounts.utils";
  import { getMaxTransactionAmount } from "$lib/utils/token.utils";
  import { Checkbox, busy } from "@dfinity/gix-components";
  import { ICPToken } from "@dfinity/utils";
  import { isNullish } from "@dfinity/utils";
  import { createEventDispatcher } from "svelte";

  export let account: Account | undefined;
  let amount: number;

  let asPublicNeuron = false;

  const dispatcher = createEventDispatcher();

  const createNeuron = async () => {
    if (isNullish(account)) {
      toastsError({
        labelKey: "error__account.not_selected",
      });
      return;
    }

    const isHardwareWallet = isAccountHardwareWallet(account);

    startBusy({
      initiator: "stake-neuron",
      labelKey: isHardwareWallet
        ? "busy_screen.pending_approval_hw"
        : "neurons.may_take_while",
    });

    const neuronId = await stakeNeuron({
      amount,
      account,
      loadNeuron: !isHardwareWallet,
      asPublicNeuron,
    });
    if (neuronId !== undefined) {
      // We don't wait for `loadBalance` to finish to give a better UX to the user.
      // Update calls might be slow.
      // But in the neurons page there are no balances nor accounts
      loadBalance({ accountIdentifier: account.identifier });

      dispatcher("nnsNeuronCreated", { neuronId });
    }

    stopBusy("stake-neuron");
  };

  let max = 0;
  $: max = getMaxTransactionAmount({
    balance: account?.balanceUlps ?? 0n,
    fee: $mainTransactionFeeE8sStore,
    token: ICPToken,
  });

  const stakeMaximum = () => (amount = max);

  const close = () => dispatcher("nnsClose");
</script>

<form
  on:submit|preventDefault={createNeuron}
  data-tid="nns-stake-neuron-component"
>
  <p class="description">{$i18n.neurons.icp_will_be_locked}</p>

  <TransactionFromAccount
    bind:selectedAccount={account}
    canSelectSource={true}
    rootCanisterId={OWN_CANISTER_ID}
    token={ICPToken}
  />

  <AmountInput bind:amount on:nnsMax={stakeMaximum} {max} />

  <TransactionFormFee transactionFee={$mainTransactionFeeStoreAsToken}>
    <svelte:fragment slot="label"
      >{$i18n.neurons.transaction_fee}</svelte:fragment
    >
  </TransactionFormFee>

  {#if $ENABLE_NEURON_VISIBILITY}
    <Separator spacing="small" />

    <Checkbox
      testId="as-public-neuron-checkbox"
      inputId="as-public-neuron-checkbox"
      checked={asPublicNeuron}
      on:nnsChange={() => (asPublicNeuron = !asPublicNeuron)}
      --checkbox-label-order="1"
      --checkbox-padding="0"
    >
      <span data-tid="as-public-neuron-checkbox-label"
        >{$i18n.neurons.create_as_public}
      </span>
      <TooltipIcon
        text={$i18n.neurons.create_as_public_tooltip}
        tooltipId="create_as_public_tooltip"
      />
    </Checkbox>
  {/if}

  <div class="toolbar">
    <button
      class="secondary"
      data-tid="stake-neuron-button-cancel"
      type="button"
      on:click={close}>{$i18n.core.cancel}</button
    >
    <button
      class="primary"
      type="submit"
      data-tid="create-neuron-button"
      disabled={amount === undefined ||
        amount <= 0 ||
        $busy ||
        isNullish(account)}
    >
      {$i18n.neurons.create}
    </button>
  </div>
</form>

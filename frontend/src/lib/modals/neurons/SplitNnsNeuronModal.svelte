<script lang="ts">
  import CurrentBalance from "$lib/components/accounts/CurrentBalance.svelte";
  import TransactionFormFee from "$lib/components/transaction/TransactionFormFee.svelte";
  import AmountInput from "$lib/components/ui/AmountInput.svelte";
  import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
  import { mainTransactionFeeE8sStore } from "$lib/derived/main-transaction-fee.derived";
  import { splitNeuron } from "$lib/services/neurons.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import {
    isNeuronControlledByHardwareWallet,
    isValidInputAmount,
    neuronStake,
  } from "$lib/utils/neuron.utils";
  import { ulpsToNumber } from "$lib/utils/token.utils";
  import { busy, Modal } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@icp-sdk/canisters/nns";
  import {
    ICPToken,
    isNullish,
    TokenAmount,
    TokenAmountV2,
  } from "@dfinity/utils";
  import { createEventDispatcher } from "svelte";

  export let neuron: NeuronInfo;

  let amount: number | undefined;

  let stakeE8s: bigint;
  $: stakeE8s = neuronStake(neuron);

  let balance: TokenAmountV2;
  $: balance = TokenAmountV2.fromUlps({ amount: stakeE8s, token: ICPToken });

  let max = 0;
  $: max =
    stakeE8s === 0n
      ? 0
      : ulpsToNumber({
          ulps: stakeE8s - $mainTransactionFeeE8sStore,
          token: ICPToken,
        });

  let validForm: boolean;
  $: validForm = isValidInputAmount(amount, max);

  let errorMessage: string | undefined;
  $: errorMessage =
    isNullish(amount) || validForm ? undefined : $i18n.error.amount_not_valid;

  const onMax = () => (amount = max);

  const dispatcher = createEventDispatcher();
  const close = () => dispatcher("nnsClose");
  const split = async () => {
    if (!isValidInputAmount(amount, max)) return;

    const hwControlled = isNeuronControlledByHardwareWallet({
      neuron,
      accounts: $icpAccountsStore,
    });
    startBusy({
      initiator: "split-neuron",
      labelKey: hwControlled ? "busy_screen.pending_approval_hw" : undefined,
    });

    const id = await splitNeuron({
      neuron,
      amount,
    });
    if (id !== undefined) {
      toastsSuccess({
        labelKey: "neuron_detail.split_neuron_success",
      });
    }
    close();
    stopBusy("split-neuron");
  };
</script>

<Modal onClose={close}>
  {#snippet title()}{$i18n.neuron_detail.split_neuron}{/snippet}
  <div class="wrapper" data-tid="split-neuron-modal">
    <CurrentBalance {balance} />
    <AmountInput
      bind:amount
      on:nnsMax={onMax}
      token={ICPToken}
      {max}
      {errorMessage}
    />
    <TransactionFormFee
      transactionFee={TokenAmount.fromE8s({
        amount: BigInt($mainTransactionFeeE8sStore),
        token: ICPToken,
      })}
    />

    <div class="toolbar">
      <button class="secondary" on:click={close}>
        {$i18n.core.cancel}
      </button>
      <button
        data-tid="split-neuron-button"
        class="primary"
        on:click={split}
        disabled={!validForm || $busy}
      >
        {$i18n.neuron_detail.split_neuron_confirm}
      </button>
    </div>
  </div>
</Modal>

<style lang="scss">
  .wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }
</style>

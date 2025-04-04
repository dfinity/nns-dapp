<script lang="ts">
  import CurrentBalance from "$lib/components/accounts/CurrentBalance.svelte";
  import TransactionFormFee from "$lib/components/transaction/TransactionFormFee.svelte";
  import AmountInput from "$lib/components/ui/AmountInput.svelte";
  import { E8S_PER_ICP } from "$lib/constants/icp.constants";
  import { splitNeuron } from "$lib/services/sns-neurons.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import { isValidInputAmount } from "$lib/utils/neuron.utils";
  import { getSnsNeuronStake } from "$lib/utils/sns-neuron.utils";
  import { busy, Modal } from "@dfinity/gix-components";
  import type { E8s } from "@dfinity/nns";
  import type { Principal } from "@dfinity/principal";
  import type { SnsNervousSystemParameters, SnsNeuron } from "@dfinity/sns";
  import {
    fromDefinedNullable,
    isNullish,
    TokenAmount,
    TokenAmountV2,
    type Token,
  } from "@dfinity/utils";
  import { createEventDispatcher } from "svelte";

  export let rootCanisterId: Principal;
  export let neuron: SnsNeuron;
  export let token: Token;
  export let parameters: SnsNervousSystemParameters;
  export let transactionFee: E8s;
  export let reloadNeuron: () => Promise<void>;

  let amount: number | undefined;

  let stakeE8s: E8s;
  $: stakeE8s = getSnsNeuronStake(neuron);

  let balance: TokenAmountV2;
  $: balance = TokenAmountV2.fromUlps({ amount: stakeE8s, token });

  let neuronMinimumStake: bigint;
  $: neuronMinimumStake = fromDefinedNullable(
    parameters.neuron_minimum_stake_e8s
  );

  // The parent neuron should have at least the minimum stake after the operation
  let max = 0;
  $: max =
    stakeE8s === 0n
      ? 0
      : Number(stakeE8s - transactionFee - neuronMinimumStake) /
        Number(E8S_PER_ICP);

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

    startBusy({ initiator: "split-sns-neuron" });

    const { success } = await splitNeuron({
      rootCanisterId,
      neuronId: fromDefinedNullable(neuron.id),
      amount,
      neuronMinimumStake,
    });

    if (success) {
      await reloadNeuron();

      toastsSuccess({
        labelKey: "neuron_detail.split_neuron_success",
      });
      stopBusy("split-sns-neuron");
      close();
    } else {
      stopBusy("split-sns-neuron");
    }
  };
</script>

<Modal on:nnsClose>
  <svelte:fragment slot="title"
    >{$i18n.neuron_detail.split_neuron}</svelte:fragment
  >
  <div class="wrapper" data-tid="split-neuron-modal">
    <CurrentBalance {balance} />
    <AmountInput bind:amount on:nnsMax={onMax} {max} {token} {errorMessage} />
    <TransactionFormFee
      transactionFee={TokenAmount.fromE8s({
        amount: transactionFee,
        token,
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

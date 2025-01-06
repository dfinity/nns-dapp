<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
  import { snsSelectedTransactionFeeStore } from "$lib/derived/sns/sns-selected-transaction-fee.store";
  import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
  import SnsNeuronTransactionModal from "$lib/modals/sns/neurons/SnsNeuronTransactionModal.svelte";
  import { increaseStakeNeuron } from "$lib/services/sns-neurons.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import type { NewTransaction } from "$lib/types/transaction";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { toTokenAmountV2 } from "$lib/utils/token.utils";
  import type { WizardStep } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import type { SnsNeuronId } from "@dfinity/sns";
  import { type Token, TokenAmountV2, nonNullish } from "@dfinity/utils";
  import { createEventDispatcher } from "svelte";

  export let neuronId: SnsNeuronId;
  export let token: Token;
  export let rootCanisterId: Principal;
  export let reloadNeuron: () => Promise<void>;

  let currentStep: WizardStep | undefined;

  let title: string;
  $: title =
    currentStep?.name === "Form"
      ? $i18n.neurons.top_up_neuron
      : $i18n.accounts.review_transaction;

  const dispatcher = createEventDispatcher();
  const increaseStake = async ({
    detail: { amount, sourceAccount: account },
  }: CustomEvent<NewTransaction>) => {
    startBusy({
      initiator: "stake-sns-neuron",
      labelKey: "neurons.may_take_while",
    });

    const { success } = await increaseStakeNeuron({
      rootCanisterId,
      amount,
      account,
      neuronId,
    });

    await reloadNeuron();

    if (success) {
      toastsSuccess({
        labelKey: "accounts.transaction_success",
        substitutions: {
          $tokenSymbol: token.symbol,
        },
      });
      dispatcher("nnsClose");
    }

    stopBusy("stake-sns-neuron");
  };

  let governanceCanisterId: Principal | undefined;
  $: governanceCanisterId =
    $snsProjectSelectedStore?.summary.governanceCanisterId;

  let transactionFee: TokenAmountV2 | undefined = undefined;
  $: transactionFee = toTokenAmountV2($snsSelectedTransactionFeeStore);
</script>

<TestIdWrapper testId="sns-increase-stake-neuron-modal-component">
  {#if nonNullish(governanceCanisterId) && nonNullish(transactionFee)}
    <SnsNeuronTransactionModal
      {rootCanisterId}
      on:nnsSubmit={increaseStake}
      on:nnsClose
      bind:currentStep
      {token}
      {transactionFee}
      {governanceCanisterId}
    >
      <svelte:fragment slot="title"
        >{title ?? $i18n.accounts.send}</svelte:fragment
      >
      <p slot="description" class="value no-margin">
        {replacePlaceholders($i18n.accounts.sns_transaction_description, {
          $token: $snsTokenSymbolSelectedStore?.symbol ?? "",
        })}
      </p>
    </SnsNeuronTransactionModal>
  {/if}
</TestIdWrapper>

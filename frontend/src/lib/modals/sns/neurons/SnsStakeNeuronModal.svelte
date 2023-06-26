<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import type {
    NewTransaction,
    ValidateAmountFn,
  } from "$lib/types/transaction";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import type { WizardStep } from "@dfinity/gix-components";
  import type { TokenAmount, Token } from "@dfinity/utils";
  import type { Principal } from "@dfinity/principal";
  import { stakeNeuron } from "$lib/services/sns-neurons.services";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import SnsTransactionModal from "$lib/modals/sns/neurons/SnsTransactionModal.svelte";
  import { snsParametersStore } from "$lib/stores/sns-parameters.store";
  import { mapNervousSystemParameters } from "$lib/utils/sns-parameters.utils";
  import type { SnsNervousSystemParameters } from "@dfinity/sns";
  import { E8S_PER_ICP } from "$lib/constants/icp.constants";
  import { nonNullish } from "@dfinity/utils";

  export let token: Token;
  export let rootCanisterId: Principal;
  export let governanceCanisterId: Principal;
  export let transactionFee: TokenAmount;

  let currentStep: WizardStep | undefined;

  let stakeNeuronText = replacePlaceholders(
    $i18n.sns_neurons.stake_sns_neuron,
    {
      $tokenSymbol: token.symbol,
    }
  );

  let title: string;
  $: title =
    currentStep?.name === "Form"
      ? stakeNeuronText
      : $i18n.accounts.review_transaction;

  let parameters: SnsNervousSystemParameters | undefined;
  $: parameters = $snsParametersStore[rootCanisterId.toText()]?.parameters;
  let minimumStake: number | undefined;
  $: minimumStake =
    parameters !== undefined
      ? Number(
          mapNervousSystemParameters(parameters).neuron_minimum_stake_e8s
        ) / E8S_PER_ICP
      : undefined;
  let checkMinimumStake: ValidateAmountFn;
  $: checkMinimumStake = ({ amount }) => {
    if (
      nonNullish(amount) &&
      nonNullish(minimumStake) &&
      amount < minimumStake
    ) {
      return replacePlaceholders(
        $i18n.error.amount_not_enough_stake_sns_neuron,
        {
          $amount: String(minimumStake),
          $token: token.symbol,
        }
      );
    }
    return undefined;
  };

  const dispatcher = createEventDispatcher();
  const stake = async ({ detail }: CustomEvent<NewTransaction>) => {
    startBusy({
      initiator: "stake-sns-neuron",
      labelKey: "neurons.may_take_while",
    });

    const { success } = await stakeNeuron({
      rootCanisterId,
      amount: detail.amount,
      account: detail.sourceAccount,
    });

    stopBusy("stake-sns-neuron");

    if (success) {
      toastsSuccess({
        labelKey: "sns_neurons.stake_sns_neuron_success",
        substitutions: {
          $tokenSymbol: token.symbol,
        },
      });
      dispatcher("nnsClose");
    }
  };
</script>

<SnsTransactionModal
  testId="sns-stake-neuron-modal-component"
  {rootCanisterId}
  on:nnsSubmit={stake}
  on:nnsClose
  bind:currentStep
  {token}
  {transactionFee}
  {governanceCanisterId}
  validateAmount={checkMinimumStake}
>
  <svelte:fragment slot="title">{title ?? $i18n.accounts.send}</svelte:fragment>
  <p slot="description" class="value no-margin">
    {stakeNeuronText}
  </p>
</SnsTransactionModal>

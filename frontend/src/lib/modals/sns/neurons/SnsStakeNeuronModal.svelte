<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import type { NewTransaction } from "$lib/types/transaction";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { numberToE8s } from "$lib/utils/token.utils";
  import type { WizardStep } from "@dfinity/gix-components";
  import type { Token, TokenAmount } from "@dfinity/nns";
  import type { Principal } from "@dfinity/principal";
  import { stakeNeuron } from "$lib/services/sns-neurons.services";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import SnsTransactionModal from "$lib/modals/sns/neurons/SnsTransactionModal.svelte";

  export let token: Token;
  export let rootCanisterId: Principal;
  export let governanceCanisterId: Principal;
  export let transactionFee: TokenAmount;

  let currentStep: WizardStep;

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

  const dispatcher = createEventDispatcher();
  const stake = async ({ detail }: CustomEvent<NewTransaction>) => {
    startBusy({
      initiator: "stake-sns-neuron",
      labelKey: "neurons.may_take_while",
    });

    const { success } = await stakeNeuron({
      rootCanisterId,
      amount: numberToE8s(detail.amount),
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

<!-- TODO: Fetch SNS params and use minimum neuron stake for validation -->
<SnsTransactionModal
  {rootCanisterId}
  on:nnsSubmit={stake}
  on:nnsClose
  bind:currentStep
  {token}
  {transactionFee}
  {governanceCanisterId}
>
  <svelte:fragment slot="title"
    >{title ?? $i18n.accounts.new_transaction}</svelte:fragment
  >
  <p slot="description" class="value">
    {stakeNeuronText}
  </p>
</SnsTransactionModal>

<script lang="ts">
  import SnsTransactionModal from "$lib/modals/sns/neurons/SnsTransactionModal.svelte";
  import type { Token, TokenAmount } from "@dfinity/nns";
  import type { Principal } from "@dfinity/principal";
  import type { WizardStep } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import { snsProjectSelectedStore } from "$lib/derived/selected-project.derived";
  import { snsSelectedTransactionFeeStore } from "$lib/derived/sns/sns-selected-transaction-fee.store";
  import { createEventDispatcher, onMount } from "svelte";
  import { syncSnsAccounts } from "$lib/services/sns-accounts.services";
  import { nonNullish } from "$lib/utils/utils";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import type { NewTransaction } from "$lib/types/transaction";
  import { increaseStakeNeuron } from "$lib/services/sns-neurons.services";
  import type { SnsNeuronId } from "@dfinity/sns";
  import { numberToE8s } from "$lib/utils/token.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";

  export let neuronId: SnsNeuronId;
  export let token: Token;
  export let rootCanisterId: Principal;
  export let reloadNeuron: () => Promise<void>;

  let currentStep: WizardStep;

  let title: string;
  $: title =
    currentStep?.name === "Form"
      ? $i18n.neurons.top_up_neuron
      : $i18n.accounts.review_transaction;

  onMount(async () => {
    if (transactionFee !== undefined && governanceCanisterId !== undefined) {
      return;
    }

    startBusy({
      initiator: "load-sns-accounts",
    });

    await syncSnsAccounts({
      rootCanisterId,
      handleError: () => stopBusySpinner(),
    });
  });

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
      amount: numberToE8s(amount),
      account,
      neuronId,
    });

    await reloadNeuron();

    if (success) {
      toastsSuccess({
        labelKey: "sns_neurons.stake_sns_neuron_success",
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

  let transactionFee: TokenAmount | undefined;
  $: transactionFee = $snsSelectedTransactionFeeStore;

  let loading = true;
  $: loading =
    transactionFee === undefined || governanceCanisterId === undefined;

  const stopBusySpinner = () => stopBusy("load-sns-accounts");

  $: loading,
    (() => {
      if (loading) {
        return;
      }

      stopBusySpinner();
    })();
</script>

{#if !loading && nonNullish(governanceCanisterId) && nonNullish(transactionFee)}
  <SnsTransactionModal
    {rootCanisterId}
    on:nnsSubmit={increaseStake}
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
      {replacePlaceholders($i18n.accounts.sns_transaction_description, {
        $token: $snsTokenSymbolSelectedStore?.symbol ?? "",
      })}
    </p>
  </SnsTransactionModal>
{/if}

<script lang="ts">
  import SnsTransactionModal from "$lib/modals/sns/neurons/SnsTransactionModal.svelte";
  import { type Token, TokenAmount } from "@dfinity/nns";
  import type { Principal } from "@dfinity/principal";
  import type { WizardStep } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import {snsProjectSelectedStore} from "$lib/derived/selected-project.derived";
  import {snsSelectedTransactionFeeStore} from "$lib/derived/sns/sns-selected-transaction-fee.store";
  import {onMount} from "svelte";
  import {syncSnsAccounts} from "$lib/services/sns-accounts.services";
  import {nonNullish} from "$lib/utils/utils";
  import {startBusy, stopBusy} from "$lib/stores/busy.store";

  export let token: Token;
  export let rootCanisterId: Principal;

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

    // TODO: on sync error close loader
    await syncSnsAccounts(rootCanisterId);
  });

  const increaseStake = async () => {
    // TODO
  };

  let governanceCanisterId: Principal | undefined;
  $: governanceCanisterId =
          $snsProjectSelectedStore?.summary.governanceCanisterId;

  let transactionFee: TokenAmount | undefined;
  $: transactionFee = $snsSelectedTransactionFeeStore;

  let loading = true;
  $: loading = transactionFee === undefined || governanceCanisterId === undefined;

  const stopBusySpinner = () => {
    if (loading) {
      return;
    }

    stopBusy("load-sns-accounts");
  }

  $: loading, stopBusySpinner()
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
    <p slot="description" class="value">here description</p>
  </SnsTransactionModal>
{/if}
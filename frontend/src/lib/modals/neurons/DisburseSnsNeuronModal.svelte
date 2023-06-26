<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import { createEventDispatcher } from "svelte";
  import { disburse } from "$lib/services/sns-neurons.services";
  import type { SnsNeuron } from "@dfinity/sns";
  import { fromDefinedNullable } from "@dfinity/utils";
  import {
    getSnsNeuronIdAsHexString,
    getSnsNeuronStake,
  } from "$lib/utils/sns-neuron.utils";
  import type { Principal } from "@dfinity/principal";
  import { TokenAmount, type Token } from "@dfinity/utils";
  import ConfirmDisburseNeuron from "$lib/components/neuron-detail/ConfirmDisburseNeuron.svelte";
  import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
  import {
    WizardModal,
    type WizardSteps,
    type WizardStep,
  } from "@dfinity/gix-components";
  import { neuronsPathStore } from "$lib/derived/paths.derived";
  import { snsProjectMainAccountStore } from "$lib/derived/sns/sns-project-accounts.derived";
  import {
    loadSnsAccounts,
    syncSnsAccounts,
  } from "$lib/services/sns-accounts.services";
  import { snsSelectedTransactionFeeStore } from "$lib/derived/sns/sns-selected-transaction-fee.store";
  import { goto } from "$app/navigation";
  import { snsOnlyProjectStore } from "$lib/derived/sns/sns-selected-project.derived";

  export let rootCanisterId: Principal;
  export let neuron: SnsNeuron;
  export let reloadNeuron: () => Promise<void>;

  let source: string;
  $: source = getSnsNeuronIdAsHexString(neuron);

  let amount: TokenAmount;
  $: amount = TokenAmount.fromE8s({
    amount: getSnsNeuronStake(neuron),
    token: $snsTokenSymbolSelectedStore as Token,
  });

  let fee: TokenAmount | undefined;
  $: fee = $snsSelectedTransactionFeeStore;

  const dispatcher = createEventDispatcher();
  // WizardModal was used to add extra steps afterwards to easily support disbursing to other accounts and/or provide custom amount?
  const steps: WizardSteps = [
    {
      name: "ConfirmDisburse",
      title: $i18n.accounts.review_transaction,
    },
  ];

  let currentStep: WizardStep | undefined;
  let loading = false;

  let destinationAddress: string | undefined;
  $: destinationAddress = $snsProjectMainAccountStore?.identifier;

  // load project accounts if not available
  const syncProjectAccountIfNotAvailable = async (
    selectedProjectCanisterId: Principal | undefined
  ) => {
    if (
      selectedProjectCanisterId === undefined ||
      $snsProjectMainAccountStore !== undefined
    ) {
      return;
    }

    loading = true;
    await syncSnsAccounts({ rootCanisterId: selectedProjectCanisterId });
    loading = false;
  };

  $: syncProjectAccountIfNotAvailable($snsOnlyProjectStore);

  const executeTransaction = async () => {
    startBusy({
      initiator: "disburse-sns-neuron",
    });

    loading = true;

    const { success } = await disburse({
      rootCanisterId,
      neuronId: fromDefinedNullable(neuron.id),
    });

    await Promise.all([loadSnsAccounts({ rootCanisterId }), reloadNeuron()]);

    loading = false;

    stopBusy("disburse-sns-neuron");

    if (success) {
      toastsSuccess({
        labelKey: "neuron_detail.disburse_success",
      });

      await goto($neuronsPathStore, { replaceState: true });
    }

    dispatcher("nnsClose");
  };
</script>

<WizardModal bind:currentStep on:nnsClose {steps}>
  <svelte:fragment slot="title"
    ><span data-tid="disburse-sns-neuron-modal">{currentStep?.title}</span
    ></svelte:fragment
  >
  {#if currentStep?.name === "ConfirmDisburse" && destinationAddress !== undefined}
    <ConfirmDisburseNeuron
      on:nnsClose
      on:nnsBack={() => {
        dispatcher("nnsClose");
      }}
      on:nnsConfirm={executeTransaction}
      secondaryButtonText={$i18n.core.cancel}
      {amount}
      {source}
      {loading}
      {destinationAddress}
      {fee}
    />
  {/if}
</WizardModal>

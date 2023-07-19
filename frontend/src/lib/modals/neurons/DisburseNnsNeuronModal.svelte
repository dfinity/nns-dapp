<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import { TokenAmount, ICPToken } from "@dfinity/utils";
  import {
    WizardModal,
    type WizardSteps,
    type WizardStep,
  } from "@dfinity/gix-components";
  import ConfirmDisburseNeuron from "$lib/components/neuron-detail/ConfirmDisburseNeuron.svelte";
  import NnsDestinationAddress from "$lib/components/accounts/NnsDestinationAddress.svelte";
  import { startBusyNeuron } from "$lib/services/busy.services";
  import { stopBusy } from "$lib/stores/busy.store";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import { createEventDispatcher, onDestroy } from "svelte";
  import { disburse } from "$lib/services/neurons.services";
  import { neuronStake } from "$lib/utils/neuron.utils";
  import { neuronsPathStore } from "$lib/derived/paths.derived";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import {
    cancelPollAccounts,
    pollAccounts,
  } from "$lib/services/icp-accounts.services";
  import { ENABLE_ICP_ICRC } from "$lib/stores/feature-flags.store";

  export let neuron: NeuronInfo;

  onMount(() => {
    pollAccounts({ icrcEnabled: $ENABLE_ICP_ICRC });
  });

  onDestroy(() => {
    cancelPollAccounts();
  });

  const dispatcher = createEventDispatcher();
  const steps: WizardSteps = [
    {
      name: "SelectDestination",
      title: $i18n.neuron_detail.disburse_neuron_title,
    },
    {
      name: "ConfirmDisburse",
      title: $i18n.accounts.review_transaction,
    },
  ];

  let currentStep: WizardStep | undefined;
  let modal: WizardModal;
  let loading = false;
  let amount: TokenAmount;
  $: amount = TokenAmount.fromE8s({
    amount: neuronStake(neuron),
    token: ICPToken,
  });

  let destinationAddress: string | undefined;

  const onSelectAddress = ({
    detail: { address },
  }: CustomEvent<{ address: string }>) => {
    destinationAddress = address;
    modal.next();
  };

  const executeTransaction = async () => {
    startBusyNeuron({
      initiator: "disburse-neuron",
      neuronId: neuron.neuronId,
    });

    loading = true;

    const { success } = await disburse({
      neuronId: neuron.neuronId,
      toAccountId: destinationAddress as string,
    });

    loading = false;

    stopBusy("disburse-neuron");

    if (success) {
      toastsSuccess({
        labelKey: "neuron_detail.disburse_success",
      });
    }

    // We need to dispatch the nnsClose event before we navigate away
    // Otherwise the parent component that needs to close the modal is unmounted before closing the modal
    dispatcher("nnsClose");

    if (success) {
      await goto($neuronsPathStore, { replaceState: true });
    }
  };
</script>

<WizardModal
  testId="disburse-nns-neuron-modal-component"
  {steps}
  bind:currentStep
  bind:this={modal}
  on:nnsClose
>
  <svelte:fragment slot="title"
    ><span data-tid="disburse-neuron-modal">{currentStep?.title}</span
    ></svelte:fragment
  >
  {#if currentStep?.name === "SelectDestination"}
    <NnsDestinationAddress on:nnsAddress={onSelectAddress} />
  {/if}
  {#if currentStep?.name === "ConfirmDisburse" && destinationAddress !== undefined}
    <ConfirmDisburseNeuron
      on:nnsClose
      on:nnsConfirm={executeTransaction}
      {amount}
      source={neuron.neuronId.toString()}
      {loading}
      {destinationAddress}
      on:nnsBack={modal.back}
    />
  {/if}
</WizardModal>

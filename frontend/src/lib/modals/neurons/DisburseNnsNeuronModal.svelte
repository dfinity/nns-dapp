<script lang="ts">
  import QrWizardModal from "$lib/modals/transaction/QrWizardModal.svelte";
  import type { QrResponse } from "$lib/types/qr-wizard-modal";
  import { i18n } from "$lib/stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import {
    ICPToken,
    type Token,
    assertNonNullish,
    TokenAmountV2,
  } from "@dfinity/utils";
  import type {
    WizardModal,
    WizardSteps,
    WizardStep,
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

  export let neuron: NeuronInfo;

  onMount(() => {
    pollAccounts();
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
  let amount: TokenAmountV2;
  $: amount = TokenAmountV2.fromUlps({
    amount: neuronStake(neuron),
    token: ICPToken,
  });

  let showManualAddress = false;
  let destinationAddress: string;

  let scanQrCode: ({
    requiredToken,
  }: {
    requiredToken: Token;
  }) => Promise<QrResponse>;

  const goQRCode = async () => {
    const { result, identifier } = await scanQrCode({
      requiredToken: ICPToken,
    });

    if (result !== "success") {
      return;
    }
    // When result === "success", identifier is always defined.
    assertNonNullish(identifier);

    destinationAddress = identifier;
  };

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

<QrWizardModal
  testId="disburse-nns-neuron-modal-component"
  {steps}
  bind:currentStep
  bind:modal
  bind:scanQrCode
  on:nnsClose
>
  <svelte:fragment slot="title"
    ><span data-tid="disburse-neuron-modal">{currentStep?.title}</span
    ></svelte:fragment
  >
  {#if currentStep?.name === "SelectDestination"}
    <NnsDestinationAddress
      bind:showManualAddress
      bind:selectedDestinationAddress={destinationAddress}
      on:nnsAddress={onSelectAddress}
      on:nnsOpenQRCodeReader={goQRCode}
    />
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
</QrWizardModal>

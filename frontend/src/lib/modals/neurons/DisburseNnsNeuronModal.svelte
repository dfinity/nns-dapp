<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { ICPToken, TokenAmount, type NeuronInfo } from "@dfinity/nns";
  import LegacyWizardModal from "$lib/modals/LegacyWizardModal.svelte";
  import type { Step, Steps } from "$lib/stores/steps.state";
  import ConfirmDisburseNeuron from "$lib/components/neuron-detail/ConfirmDisburseNeuron.svelte";
  import DestinationAddress from "$lib/components/accounts/DestinationAddress.svelte";
  import { startBusyNeuron } from "$lib/services/busy.services";
  import { stopBusy } from "$lib/stores/busy.store";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import { routeStore } from "$lib/stores/route.store";
  import { createEventDispatcher } from "svelte";
  import { disburse } from "$lib/services/neurons.services";
  import { neuronStake } from "$lib/utils/neuron.utils";
  import { neuronsPathStore } from "$lib/derived/paths.derived";

  export let neuron: NeuronInfo;

  const dispatcher = createEventDispatcher();
  const steps: Steps = [
    {
      name: "SelectDestination",
      showBackButton: false,
      title: $i18n.neuron_detail.disburse_neuron_title,
    },
    {
      name: "ConfirmDisburse",
      showBackButton: true,
      title: $i18n.accounts.review_transaction,
    },
  ];

  let currentStep: Step;
  let modal: LegacyWizardModal;
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

      routeStore.replace({
        path: $neuronsPathStore,
      });
    }

    dispatcher("nnsClose");
  };
</script>

<LegacyWizardModal {steps} bind:currentStep bind:this={modal} on:nnsClose>
  <svelte:fragment slot="title"
    ><span data-tid="disburse-neuron-modal">{currentStep?.title}</span
    ></svelte:fragment
  >
  {#if currentStep.name === "SelectDestination"}
    <DestinationAddress on:nnsAddress={onSelectAddress} />
  {/if}
  {#if currentStep.name === "ConfirmDisburse" && destinationAddress !== undefined}
    <ConfirmDisburseNeuron
      on:nnsClose
      on:nnsConfirm={executeTransaction}
      {amount}
      source={neuron.neuronId.toString()}
      {loading}
      {destinationAddress}
    />
  {/if}
</LegacyWizardModal>

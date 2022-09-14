<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import WizardModal from "../WizardModal.svelte";
  import type { Step, Steps } from "../../stores/steps.state";
  import ConfirmDisburseNeuron from "../../components/neuron-detail/ConfirmDisburseNeuron.svelte";
  import DestinationAddress from "../../components/accounts/DestinationAddress.svelte";
  import { startBusyNeuron } from "../../services/busy.services";

  import { stopBusy } from "../../stores/busy.store";
  import { toastsSuccess } from "../../stores/toasts.store";
  import { routeStore } from "../../stores/route.store";
  import { createEventDispatcher } from "svelte";
  import { AppPath } from "../../constants/routes.constants";
  import { disburse } from "../../services/neurons.services";

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
  let modal: WizardModal;
  let loading: boolean = false;

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
        path: AppPath.LegacyNeurons,
      });
    }

    dispatcher("nnsClose");
  };
</script>

<WizardModal {steps} bind:currentStep bind:this={modal} on:nnsClose>
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
      {neuron}
      {loading}
      {destinationAddress}
    />
  {/if}
</WizardModal>

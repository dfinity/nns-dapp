<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import WizardModal from "../WizardModal.svelte";
  import type { Step, Steps } from "../../stores/steps.state";
  import ConfirmDisburseNeuron from "../../components/neuron-detail/ConfirmDisburseNeuron.svelte";
  import DestinationAddress from "../../components/accounts/DestinationAddress.svelte";

  export let neuron: NeuronInfo;

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

  let destinationAddress: string | undefined;

  const onSelectAddress = ({
    detail: { address },
  }: CustomEvent<{ address: string }>) => {
    destinationAddress = address;
    modal.next();
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
    <ConfirmDisburseNeuron on:nnsClose {neuron} {destinationAddress} />
  {/if}
</WizardModal>

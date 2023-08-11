<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { formatPercentage } from "$lib/utils/format.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { createEventDispatcher } from "svelte";
  import NeuronSelectPercentage from "$lib/components/neuron-detail/NeuronSelectPercentage.svelte";
  import NeuronConfirmActionScreen from "$lib/components/neuron-detail/NeuronConfirmActionScreen.svelte";
  import {
    Html,
    WizardModal,
    type WizardSteps,
    type WizardStep,
  } from "@dfinity/gix-components";

  export let formattedMaturity: string;
  export let formattedDestination: string;

  const steps: WizardSteps = [
    {
      name: "SelectPercentage",
      title: $i18n.neuron_detail.disburse_maturity_modal_title,
    },
    {
      name: "ConfirmDisburseMaturity",
      title: $i18n.neuron_detail.disburse_maturity_confirmation_modal_title,
    },
  ];

  let currentStep: WizardStep | undefined;
  let modal: WizardModal;

  let percentageToDisburse = 0;

  const dispatcher = createEventDispatcher();
  const disburseNeuronMaturity = () =>
    dispatcher("nnsDisburseMaturity", { percentageToDisburse });
  const close = () => dispatcher("nnsClose");

  const goToConfirm = () => modal.next();
</script>

<WizardModal {steps} bind:currentStep on:nnsClose bind:this={modal}>
  <svelte:fragment slot="title"
    >{currentStep?.title ?? steps[0].title}</svelte:fragment
  >

  {#if currentStep?.name === "SelectPercentage"}
    <NeuronSelectPercentage
      {formattedMaturity}
      buttonText={$i18n.neuron_detail.disburse_maturity}
      on:nnsSelectPercentage={goToConfirm}
      on:nnsCancel={close}
      bind:percentage={percentageToDisburse}
      disabled={percentageToDisburse === 0}
    >
      <svelte:fragment slot="text">
        {replacePlaceholders(
          $i18n.neuron_detail.disburse_maturity_modal_description,
          {
            $account: formattedDestination,
          }
        )}
      </svelte:fragment>
    </NeuronSelectPercentage>
  {:else if currentStep?.name === "ConfirmDisburseMaturity"}
    <NeuronConfirmActionScreen
      on:nnsConfirm={disburseNeuronMaturity}
      on:nnsCancel={modal.back}
    >
      <Html
        text={replacePlaceholders(
          $i18n.neuron_detail.disburse_maturity_confirmation_description,
          {
            $percentage: formatPercentage(percentageToDisburse / 100, {
              minFraction: 0,
              maxFraction: 0,
            }),
          }
        )}
      />
    </NeuronConfirmActionScreen>
  {/if}
</WizardModal>

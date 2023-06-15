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

  const steps: WizardSteps = [
    {
      name: "SelectPercentage",
      title: $i18n.neuron_detail.stake_maturity_modal_title,
    },
    {
      name: "ConfirmStake",
      title: $i18n.neuron_detail.stake_confirmation_modal_title,
    },
  ];

  let currentStep: WizardStep | undefined;
  let modal: WizardModal;

  let percentageToStake = 0;

  const dispatcher = createEventDispatcher();
  const stakeNeuronMaturity = () =>
    dispatcher("nnsStakeMaturity", { percentageToStake });
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
      buttonText={$i18n.neuron_detail.stake}
      on:nnsSelectPercentage={goToConfirm}
      on:nnsCancel={close}
      bind:percentage={percentageToStake}
      disabled={percentageToStake === 0}
    >
      <svelte:fragment slot="text">
        {$i18n.neuron_detail.stake_maturity_modal_description}
      </svelte:fragment>
    </NeuronSelectPercentage>
  {:else if currentStep?.name === "ConfirmStake"}
    <NeuronConfirmActionScreen
      on:nnsConfirm={stakeNeuronMaturity}
      on:nnsCancel={modal.back}
    >
      <Html
        text={replacePlaceholders(
          $i18n.neuron_detail.stake_maturity_confirmation,
          {
            $percentage: formatPercentage(percentageToStake / 100, {
              minFraction: 0,
              maxFraction: 0,
            }),
          }
        )}
      />
    </NeuronConfirmActionScreen>
  {/if}
</WizardModal>

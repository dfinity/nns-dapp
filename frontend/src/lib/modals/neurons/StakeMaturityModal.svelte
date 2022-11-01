<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import { formatPercentage } from "$lib/utils/format.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { stopBusy } from "@dfinity/gix-components";
  import { stakeMaturity } from "$lib/services/neurons.services";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import { createEventDispatcher } from "svelte";
  import NeuronSelectPercentage from "$lib/components/neuron-detail/NeuronSelectPercentage.svelte";
  import NeuronConfirmActionScreen from "$lib/components/neuron-detail/NeuronConfirmActionScreen.svelte";
  import { startBusyNeuron } from "$lib/services/busy.services";
  import {
    Html,
    WizardModal,
    type WizardSteps,
    type WizardStep,
  } from "@dfinity/gix-components";
  import type { NeuronId } from "@dfinity/nns";

  export let neuron: NeuronInfo;

  let neuronId: NeuronId;
  $: ({ neuronId } = neuron);

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

  let currentStep: WizardStep;
  let modal: WizardModal;

  let percentageToStake = 0;

  const dispatcher = createEventDispatcher();
  const close = () => dispatcher("nnsClose");

  const stakeNeuronMaturity = async () => {
    startBusyNeuron({ initiator: "stake-maturity", neuronId });

    const { success } = await stakeMaturity({
      neuronId,
      percentageToStake,
    });

    if (success) {
      toastsSuccess({
        labelKey: "neuron_detail.stake_maturity_success",
      });
      close();
    }

    stopBusy("stake-maturity");
  };

  const goToConfirm = () => modal.next();
</script>

<WizardModal {steps} bind:currentStep on:nnsClose bind:this={modal}>
  <svelte:fragment slot="title"
    >{currentStep?.title ?? steps[0].title}</svelte:fragment
  >

  {#if currentStep.name === "SelectPercentage"}
    <NeuronSelectPercentage
      {neuron}
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
  {:else if currentStep.name === "ConfirmStake"}
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

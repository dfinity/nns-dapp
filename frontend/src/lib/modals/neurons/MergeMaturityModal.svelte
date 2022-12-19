<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import { formatPercentage } from "$lib/utils/format.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { stopBusy } from "$lib/stores/busy.store";
  import { mergeMaturity } from "$lib/services/neurons.services";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import { createEventDispatcher } from "svelte";
  import {
    WizardModal,
    type WizardSteps,
    type WizardStep,
  } from "@dfinity/gix-components";
  import NeuronSelectPercentage from "$lib/components/neuron-detail/NeuronSelectPercentage.svelte";
  import NeuronConfirmActionScreen from "$lib/components/neuron-detail/NeuronConfirmActionScreen.svelte";
  import { startBusyNeuron } from "$lib/services/busy.services";
  import { Html } from "@dfinity/gix-components";
  import { formattedMaturity } from "$lib/utils/neuron.utils";

  export let neuron: NeuronInfo;

  const steps: WizardSteps = [
    {
      name: "SelectPercentage",
      title: $i18n.neuron_detail.merge_maturity_modal_title,
    },
    {
      name: "ConfirmMerge",
      title: $i18n.neuron_detail.merge_confirmation_modal_title,
    },
  ];

  let currentStep: WizardStep;
  let modal: WizardModal;

  let percentageToMerge = 0;

  const dispatcher = createEventDispatcher();
  const close = () => dispatcher("nnsClose");

  const mergeNeuronMaturity = async () => {
    startBusyNeuron({ initiator: "merge-maturity", neuronId: neuron.neuronId });

    const { success } = await mergeMaturity({
      neuronId: neuron.neuronId,
      percentageToMerge,
    });

    if (success) {
      toastsSuccess({
        labelKey: "neuron_detail.merge_maturity_success",
      });
      close();
    }

    stopBusy("merge-maturity");
  };

  const goToConfirm = () => modal.next();
</script>

<WizardModal {steps} bind:currentStep on:nnsClose bind:this={modal}>
  <svelte:fragment slot="title"
    >{currentStep?.title ?? steps[0].title}</svelte:fragment
  >

  {#if currentStep.name === "SelectPercentage"}
    <NeuronSelectPercentage
      formattedMaturity={formattedMaturity(neuron)}
      buttonText={$i18n.neuron_detail.merge}
      on:nnsSelectPercentage={goToConfirm}
      on:nnsCancel={close}
      bind:percentage={percentageToMerge}
      disabled={percentageToMerge === 0}
    >
      <svelte:fragment slot="text">
        {$i18n.neuron_detail.merge_maturity_modal_description}
      </svelte:fragment>
    </NeuronSelectPercentage>
  {:else if currentStep.name === "ConfirmMerge"}
    <NeuronConfirmActionScreen
      on:nnsConfirm={mergeNeuronMaturity}
      on:nnsCancel={modal.back}
    >
      <Html
        text={replacePlaceholders(
          $i18n.neuron_detail.merge_maturity_confirmation,
          {
            $percentage: formatPercentage(percentageToMerge / 100, {
              minFraction: 0,
              maxFraction: 0,
            }),
          }
        )}
      />
    </NeuronConfirmActionScreen>
  {/if}
</WizardModal>

<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import { formatPercentage } from "../../utils/format.utils";
  import { replacePlaceholders } from "../../utils/i18n.utils";
  import { stopBusy } from "../../stores/busy.store";
  import { mergeMaturity } from "../../services/neurons.services";
  import { toastsSuccess } from "../../stores/toasts.store";
  import { createEventDispatcher } from "svelte";
  import type { Step, Steps } from "../../stores/steps.state";
  import WizardModal from "../WizardModal.svelte";
  import NeuronSelectPercentage from "../../components/neuron-detail/NeuronSelectPercentage.svelte";
  import NeuronConfirmActionScreen from "../../components/neuron-detail/NeuronConfirmActionScreen.svelte";
  import { startBusyNeuron } from "../../services/busy.services";

  export let neuron: NeuronInfo;

  const steps: Steps = [
    {
      name: "SelectPercentage",
      showBackButton: false,
      title: $i18n.neuron_detail.merge_maturity_modal_title,
    },
    {
      name: "ConfirmMerge",
      showBackButton: true,
      title: $i18n.neuron_detail.merge_confirmation_modal_title,
    },
  ];

  let currentStep: Step;
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
      {neuron}
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
      {@html replacePlaceholders(
        $i18n.neuron_detail.merge_maturity_confirmation,
        {
          $percentage: formatPercentage(percentageToMerge / 100, {
            minFraction: 0,
            maxFraction: 0,
          }),
        }
      )}
    </NeuronConfirmActionScreen>
  {/if}
</WizardModal>

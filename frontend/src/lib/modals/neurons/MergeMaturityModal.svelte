<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import { formatPercentage } from "$lib/utils/format.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { stopBusy } from "$lib/stores/busy.store";
  import { mergeMaturity } from "$lib/services/neurons.services";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import { createEventDispatcher } from "svelte";
  import type { Step, Steps } from "$lib/stores/steps.state";
  import LegacyWizardModal from "$lib/modals/LegacyWizardModal.svelte";
  import SelectPercentage from "$lib/components/neuron-detail/SelectPercentage.svelte";
  import ConfirmActionScreen from "$lib/components/ui/ConfirmActionScreen.svelte";
  import { startBusyNeuron } from "$lib/services/busy.services";
  import { valueSpan } from "$lib/utils/utils";

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
  let modal: LegacyWizardModal;

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
  const goToConfirm = () => {
    modal.next();
  };
</script>

<LegacyWizardModal {steps} bind:currentStep bind:this={modal} on:nnsClose>
  <span slot="title" data-tid="merge-maturity-neuron-modal"
    >{currentStep?.title ??
      $i18n.neuron_detail.merge_maturity_modal_title}</span
  >
  {#if currentStep.name === "SelectPercentage"}
    <SelectPercentage
      {neuron}
      buttonText={$i18n.neuron_detail.merge}
      on:nnsSelectPercentage={goToConfirm}
      on:nnsBack={close}
      bind:percentage={percentageToMerge}
      disabled={percentageToMerge === 0}
    >
      <svelte:fragment slot="text">
        <h5>{$i18n.neuron_detail.merge_maturity_modal_title}</h5>
        <p class="description">
          {$i18n.neuron_detail.merge_maturity_modal_description}
        </p>
      </svelte:fragment>
    </SelectPercentage>
  {:else if currentStep.name === "ConfirmMerge"}
    <ConfirmActionScreen
      on:nnsConfirm={mergeNeuronMaturity}
      on:nnsCancel={modal.back}
    >
      <div class="confirm" slot="main-info">
        <h4>{$i18n.neuron_detail.merge_maturity_confirmation_q}</h4>
        <p class="confirm-answer">
          {@html replacePlaceholders(
            $i18n.neuron_detail.merge_maturity_confirmation_a,
            {
              $percentage: valueSpan(
                formatPercentage(percentageToMerge / 100, {
                  minFraction: 0,
                  maxFraction: 0,
                })
              ),
            }
          )}
        </p>
      </div>
      <svelte:fragment slot="button-content"
        >{$i18n.core.confirm}</svelte:fragment
      >
      <svelte:fragment slot="button-cancel-content"
        >{$i18n.neuron_detail.merge_maturity_edit_percentage}</svelte:fragment
      >
    </ConfirmActionScreen>
  {/if}
</LegacyWizardModal>

<style lang="scss">
  h4 {
    text-align: center;
  }

  .confirm-answer {
    margin: 0;
    text-align: center;
  }

  .confirm {
    display: flex;
    flex-direction: column;
  }
</style>

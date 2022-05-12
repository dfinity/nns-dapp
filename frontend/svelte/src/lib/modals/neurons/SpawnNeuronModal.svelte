<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import SelectPercentage from "../../components/neuron-detail/SelectPercentage.svelte";
  import type { Step, Steps } from "../../stores/steps.state";
  import WizardModal from "../WizardModal.svelte";
  import ConfirmActionScreen from "../../components/ui/ConfirmActionScreen.svelte";
  import { formatPercentage } from "../../utils/format.utils";
  import { startBusy, stopBusy } from "../../stores/busy.store";
  import { createEventDispatcher } from "svelte";
  import { spawnNeuron } from "../../services/neurons.services";
  import { toastsStore } from "../../stores/toasts.store";
  import { replacePlaceholders } from "../../utils/i18n.utils";
  import { isEnoughMaturityToSpawn } from "../../utils/neuron.utils";

  export let neuron: NeuronInfo;
  export let controlledByHarwareWallet: boolean;

  const hardwareWalletSteps: Steps = [
    {
      name: "ConfirmSpawn",
      showBackButton: false,
      title: $i18n.neuron_detail.spawn_confirmation_modal_title,
    },
  ];
  const nnsDappAccountSteps: Steps = [
    {
      name: "SelectPercentage",
      showBackButton: false,
      title: $i18n.neuron_detail.spawn_maturity_modal_title,
    },
    {
      name: "ConfirmSpawn",
      showBackButton: true,
      title: $i18n.neuron_detail.spawn_confirmation_modal_title,
    },
  ];
  const steps: Steps = controlledByHarwareWallet
    ? hardwareWalletSteps
    : nnsDappAccountSteps;

  let currentStep: Step;
  let modal: WizardModal;

  let percentageToSpawn: number = 0;
  let loading: boolean;

  let enoughMaturityToSpawn: boolean;
  $: enoughMaturityToSpawn = isEnoughMaturityToSpawn({
    neuron,
    percentage: percentageToSpawn,
  });

  const dispatcher = createEventDispatcher();
  const spawnNeuronFromMaturity = async () => {
    loading = true;
    startBusy("spawn-neuron");
    const { success } = await spawnNeuron({
      neuronId: neuron.neuronId,
      percentageToSpawn,
    });
    if (success) {
      toastsStore.success({
        labelKey: "neuron_detail.spawn_maturity_success",
      });
      dispatcher("nnsClose");
    }
    loading = false;
    stopBusy("spawn-neuron");
  };
  const goToConfirm = () => {
    modal.next();
  };
</script>

<WizardModal {steps} bind:currentStep bind:this={modal} on:nnsClose>
  <svelte:fragment slot="title"
    >{currentStep?.title ??
      $i18n.neuron_detail.spawn_maturity_modal_title}</svelte:fragment
  >
  {#if currentStep.name === "SelectPercentage"}
    <SelectPercentage
      {neuron}
      buttonText={$i18n.neuron_detail.spawn}
      on:nnsSelectPercentage={goToConfirm}
      bind:percentage={percentageToSpawn}
      disabled={!enoughMaturityToSpawn}
    >
      <svelte:fragment slot="text">
        <h5>{$i18n.neuron_detail.spawn_maturity_modal_title}</h5>
        <p>{$i18n.neuron_detail.spawn_maturity_modal_description}</p>
      </svelte:fragment>
    </SelectPercentage>
  {:else if currentStep.name === "ConfirmSpawn"}
    <ConfirmActionScreen {loading} on:nnsConfirm={spawnNeuronFromMaturity}>
      <div class="confirm" slot="main-info">
        <h4>{$i18n.neuron_detail.spawn_maturity_confirmation_q}</h4>
        <p class="confirm-answer">
          {replacePlaceholders(
            $i18n.neuron_detail.spawn_maturity_confirmation_a,
            {
              $percentage: formatPercentage(percentageToSpawn / 100, {
                minFraction: 0,
                maxFraction: 0,
              }),
            }
          )}
        </p>
      </div>
      <svelte:fragment slot="button-content"
        >{$i18n.core.confirm}</svelte:fragment
      >
    </ConfirmActionScreen>
  {/if}
</WizardModal>

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

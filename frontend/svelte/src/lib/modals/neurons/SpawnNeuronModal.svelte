<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import SelectPercentage from "../../components/neuron-detail/SelectPercentage.svelte";
  import type { Step, Steps } from "../../stores/steps.state";
  import WizardModal from "../WizardModal.svelte";
  import ConfirmActionScreen from "../../components/ui/ConfirmActionScreen.svelte";
  import { formatPercentage } from "../../utils/format.utils";
  import { stopBusy } from "../../stores/busy.store";
  import { createEventDispatcher } from "svelte";
  import { spawnNeuron } from "../../services/neurons.services";
  import { toastsStore } from "../../stores/toasts.store";
  import { replacePlaceholders } from "../../utils/i18n.utils";
  import { isEnoughMaturityToSpawn } from "../../utils/neuron.utils";
  import { startBusyNeuron } from "../../services/busy.services";
  import { ENABLE_NEW_SPAWN_FEATURE } from "../../constants/environment.constants";
  import ConfirmSpawnHW from "../../components/neuron-detail/ConfirmSpawnHW.svelte";

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

  let enoughMaturityToSpawn: boolean;
  $: enoughMaturityToSpawn = isEnoughMaturityToSpawn({
    neuron,
    percentage: percentageToSpawn,
  });

  let percentageMessage: string;
  $: percentageMessage = controlledByHarwareWallet
    ? "100%"
    : formatPercentage(percentageToSpawn / 100, {
        minFraction: 0,
        maxFraction: 0,
      });

  const dispatcher = createEventDispatcher();
  const spawnNeuronFromMaturity = async () => {
    startBusyNeuron({ initiator: "spawn-neuron", neuronId: neuron.neuronId });

    const { success } = await spawnNeuron({
      neuronId: neuron.neuronId,
      percentageToSpawn: controlledByHarwareWallet
        ? undefined
        : percentageToSpawn,
    });
    if (success) {
      toastsStore.success({
        labelKey: "neuron_detail.spawn_maturity_success",
      });
      dispatcher("nnsClose");
    }

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
  {#if currentStep.name === "SelectPercentage" && !ENABLE_NEW_SPAWN_FEATURE}
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
  {:else if currentStep.name === "SelectPercentage" && ENABLE_NEW_SPAWN_FEATURE}
    <SelectPercentage
      {neuron}
      buttonText={$i18n.neuron_detail.spawn}
      on:nnsSelectPercentage={spawnNeuronFromMaturity}
      bind:percentage={percentageToSpawn}
      disabled={!enoughMaturityToSpawn}
    >
      <h5 slot="text">{$i18n.neuron_detail.spawn_maturity_choose}</h5>
      <p slot="description">
        {@html $i18n.neuron_detail.spawn_maturity_explanation}
      </p>
    </SelectPercentage>
  {:else if currentStep.name === "ConfirmSpawn" && ENABLE_NEW_SPAWN_FEATURE}
    <ConfirmSpawnHW {neuron} on:nnsConfirm={spawnNeuronFromMaturity} />
  {:else if currentStep.name === "ConfirmSpawn" && !ENABLE_NEW_SPAWN_FEATURE}
    <ConfirmActionScreen on:nnsConfirm={spawnNeuronFromMaturity}>
      <div class="confirm" slot="main-info">
        <h4>{$i18n.neuron_detail.spawn_maturity_confirmation_q}</h4>
        <p class="confirm-answer">
          {replacePlaceholders(
            $i18n.neuron_detail.spawn_maturity_confirmation_a,
            {
              $percentage: percentageMessage,
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

  p {
    // For the link inside "i18n.neuron_detail.spawn_maturity_explanation"
    :global(a) {
      color: var(--primary);
      text-decoration: none;
      font-size: inherit;
      line-height: inherit;
    }
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

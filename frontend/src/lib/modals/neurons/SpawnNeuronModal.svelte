<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import SelectPercentage from "../../components/neuron-detail/SelectPercentage.svelte";
  import type { Step, Steps } from "../../stores/steps.state";
  import WizardModal from "../WizardModal.svelte";
  import { formatPercentage } from "../../utils/format.utils";
  import { stopBusy } from "../../stores/busy.store";
  import { createEventDispatcher } from "svelte";
  import { spawnNeuron } from "../../services/neurons.services";
  import { toastsStore } from "../../stores/toasts.store";
  import { isEnoughMaturityToSpawn } from "../../utils/neuron.utils";
  import { startBusyNeuron } from "../../services/busy.services";
  import ConfirmSpawnHW from "../../components/neuron-detail/ConfirmSpawnHW.svelte";
  import { routeStore } from "../../stores/route.store";
  import { AppPath } from "../../constants/routes.constants";

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
  const close = () => dispatcher("nnsClose");
  const spawnNeuronFromMaturity = async () => {
    startBusyNeuron({ initiator: "spawn-neuron", neuronId: neuron.neuronId });

    const newNeuronId = await spawnNeuron({
      neuronId: neuron.neuronId,
      percentageToSpawn: controlledByHarwareWallet
        ? undefined
        : percentageToSpawn,
    });
    if (newNeuronId !== undefined) {
      toastsStore.show({
        level: "success",
        labelKey: "neuron_detail.spawn_maturity_success",
        substitutions: {
          $neuronId: String(newNeuronId),
        },
      });
      close();
      routeStore.navigate({ path: AppPath.Neurons });
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
  {#if currentStep.name === "SelectPercentage"}
    <SelectPercentage
      {neuron}
      buttonText={$i18n.neuron_detail.spawn}
      on:nnsSelectPercentage={spawnNeuronFromMaturity}
      on:nnsBack={close}
      bind:percentage={percentageToSpawn}
      disabled={!enoughMaturityToSpawn}
    >
      <h5 slot="text">{$i18n.neuron_detail.spawn_maturity_choose}</h5>
      <div slot="description" class="description">
        <p>
          {@html $i18n.neuron_detail.spawn_maturity_explanation_1}
        </p>
        <p>
          {@html $i18n.neuron_detail.spawn_maturity_explanation_2}
        </p>
      </div>
    </SelectPercentage>
  {:else if currentStep.name === "ConfirmSpawn"}
    <ConfirmSpawnHW {neuron} on:nnsConfirm={spawnNeuronFromMaturity} />
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

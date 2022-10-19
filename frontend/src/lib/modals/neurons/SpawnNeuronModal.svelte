<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import NeuronSelectPercentage from "$lib/components/neuron-detail/NeuronSelectPercentage.svelte";
  import type { Step, Steps } from "$lib/stores/steps.state";
  import WizardModal from "../WizardModal.svelte";
  import { stopBusy } from "$lib/stores/busy.store";
  import { createEventDispatcher } from "svelte";
  import { spawnNeuron } from "$lib/services/neurons.services";
  import { toastsShow } from "$lib/stores/toasts.store";
  import { isEnoughMaturityToSpawn } from "$lib/utils/neuron.utils";
  import { startBusyNeuron } from "$lib/services/busy.services";
  import ConfirmSpawnHW from "$lib/components/neuron-detail/ConfirmSpawnHW.svelte";
  import { routeStore } from "$lib/stores/route.store";
  import { AppPath, AppPathLegacy } from "$lib/constants/routes.constants";
  import { goto } from "$app/navigation";

  export let neuron: NeuronInfo;
  export let controlledByHardwareWallet: boolean;

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
      title: $i18n.neuron_detail.spawn_neuron_modal_title,
    },
    {
      name: "ConfirmSpawn",
      showBackButton: true,
      title: $i18n.neuron_detail.spawn_confirmation_modal_title,
    },
  ];
  const steps: Steps = controlledByHardwareWallet
    ? hardwareWalletSteps
    : nnsDappAccountSteps;

  let currentStep: Step;

  let percentageToSpawn = 0;

  let enoughMaturityToSpawn: boolean;
  $: enoughMaturityToSpawn = isEnoughMaturityToSpawn({
    neuron,
    percentage: percentageToSpawn,
  });

  const dispatcher = createEventDispatcher();
  const close = () => dispatcher("nnsClose");

  const spawnNeuronFromMaturity = async () => {
    startBusyNeuron({ initiator: "spawn-neuron", neuronId: neuron.neuronId });

    const newNeuronId = await spawnNeuron({
      neuronId: neuron.neuronId,
      percentageToSpawn: controlledByHardwareWallet
        ? undefined
        : percentageToSpawn,
    });
    if (newNeuronId !== undefined) {
      toastsShow({
        level: "success",
        labelKey: "neuron_detail.spawn_neuron_success",
        substitutions: {
          $neuronId: String(newNeuronId),
        },
      });
      close();

      // TODO(GIX-1071): utils?
      await goto(AppPath.Neurons);
    }

    stopBusy("spawn-neuron");
  };
</script>

<WizardModal {steps} bind:currentStep on:nnsClose>
  <svelte:fragment slot="title"
    >{currentStep?.title ?? steps[0].title}</svelte:fragment
  >
  {#if currentStep.name === "SelectPercentage"}
    <NeuronSelectPercentage
      {neuron}
      buttonText={$i18n.neuron_detail.spawn}
      on:nnsSelectPercentage={spawnNeuronFromMaturity}
      on:nnsCancel={close}
      bind:percentage={percentageToSpawn}
      disabled={!enoughMaturityToSpawn}
    >
      <svelte:fragment slot="text"
        >{$i18n.neuron_detail.spawn_neuron_choose}</svelte:fragment
      >
      <svelte:fragment slot="description">
        <p class="description">
          {@html $i18n.neuron_detail.spawn_neuron_explanation_1}
        </p>
        <p class="description">
          {@html $i18n.neuron_detail.spawn_neuron_explanation_2}
        </p>
      </svelte:fragment>
    </NeuronSelectPercentage>
  {:else if currentStep.name === "ConfirmSpawn"}
    <ConfirmSpawnHW {neuron} on:nnsConfirm={spawnNeuronFromMaturity} />
  {/if}
</WizardModal>

<style lang="scss">
  .description:first-of-type {
    margin-top: var(--padding-2x);
  }
</style>

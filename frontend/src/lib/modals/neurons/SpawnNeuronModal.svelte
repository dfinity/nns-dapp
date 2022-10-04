<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import SelectPercentage from "$lib/components/neuron-detail/SelectPercentage.svelte";
  import type { Step, Steps } from "$lib/stores/steps.state";
  import LegacyWizardModal from "$lib/modals/LegacyWizardModal.svelte";
  import { stopBusy } from "$lib/stores/busy.store";
  import { createEventDispatcher } from "svelte";
  import { spawnNeuron } from "$lib/services/neurons.services";
  import { toastsShow } from "$lib/stores/toasts.store";
  import { isEnoughMaturityToSpawn } from "$lib/utils/neuron.utils";
  import { startBusyNeuron } from "$lib/services/busy.services";
  import ConfirmSpawnHW from "$lib/components/neuron-detail/ConfirmSpawnHW.svelte";
  import { routeStore } from "$lib/stores/route.store";
  import { AppPath } from "$lib/constants/routes.constants";

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
      title: $i18n.neuron_detail.spawn_maturity_modal_title,
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

  let percentageToSpawn: number = 0;

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
        labelKey: "neuron_detail.spawn_maturity_success",
        substitutions: {
          $neuronId: String(newNeuronId),
        },
      });
      close();
      routeStore.navigate({ path: AppPath.LegacyNeurons });
    }

    stopBusy("spawn-neuron");
  };
</script>

<LegacyWizardModal {steps} bind:currentStep on:nnsClose>
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
</LegacyWizardModal>

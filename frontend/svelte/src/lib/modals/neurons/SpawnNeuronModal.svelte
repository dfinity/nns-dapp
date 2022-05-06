<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import { ICP, type NeuronInfo } from "@dfinity/nns";
  import SelectPercentage from "../../components/neuron-detail/SelectPercentage.svelte";
  import type { Step, Steps } from "../../stores/steps.state";
  import WizardModal from "../WizardModal.svelte";
  import ConfirmActionScreen from "../../components/ui/ConfirmActionScreen.svelte";
  import { formatPercentage } from "../../utils/format.utils";
  import { neuronStake } from "../../utils/neuron.utils";
  import { startBusy, stopBusy } from "../../stores/busy.store";
  import { createEventDispatcher } from "svelte";
  import { spawnNeuron } from "../../services/neurons.services";
  import { toastsStore } from "../../stores/toasts.store";
  import { replacePlaceholders } from "../../utils/i18n.utils";

  export let neuron: NeuronInfo;

  const steps: Steps = [
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

  let currentStep: Step;
  let modal: WizardModal;

  let percentageToSpawn: number = 0;
  let loading: boolean;

  let neuronICP: bigint;
  $: neuronICP = neuronStake(neuron);

  let newNeuronICP: ICP;
  $: newNeuronICP =
    neuron.fullNeuron === undefined
      ? ICP.fromE8s(BigInt(0))
      : ICP.fromE8s(
          BigInt(
            Math.round(
              (percentageToSpawn / 100) *
                Number(neuron.fullNeuron.maturityE8sEquivalent)
            )
          )
        );

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
      cardTitle={$i18n.neuron_detail.spawn_maturity_modal_title}
      cardSubtitle={$i18n.neuron_detail.spawn_maturity_modal_description}
      buttonText={$i18n.neuron_detail.spawn}
      on:nnsSelectPercentage={goToConfirm}
      bind:percentage={percentageToSpawn}
    />
  {:else if currentStep.name === "ConfirmSpawn"}
    <ConfirmActionScreen {loading} on:nnsConfirm={spawnNeuronFromMaturity}>
      <h4 slot="main-info">
        {replacePlaceholders($i18n.neuron_detail.spawn_maturity_confirmation, {
          $percentage: formatPercentage(percentageToSpawn / 100, {
            minFraction: 0,
            maxFraction: 0,
          }),
        })}
      </h4>
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
</style>

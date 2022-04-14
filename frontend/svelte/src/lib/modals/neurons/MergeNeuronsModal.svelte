<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import WizardModal from "../WizardModal.svelte";
  import type { Step, Steps } from "../../stores/steps.state";
  import SelectNeurons from "../../components/neurons/SelectNeurons.svelte";
  import ConfirmNeuronsMerge from "../../components/neurons/ConfirmNeuronsMerge.svelte";
  import type { NeuronInfo } from "@dfinity/nns";
  import { definedNeuronsStore } from "../../stores/neurons.store";
  import {
    mapMergeableNeurons,
    checkInvalidState,
    type InvalidState,
    type MergeableNeuron,
  } from "../../utils/neuron.utils";
  import { toastsStore } from "../../stores/toasts.store";
  import { createEventDispatcher } from "svelte";
  import { MAX_NEURONS_MERGED } from "../../constants/neurons.constants";
  import { authStore } from "../../stores/auth.store";

  let neurons: MergeableNeuron[];
  $: neurons = mapMergeableNeurons({
    neurons: $definedNeuronsStore,
    identity: $authStore.identity,
  });

  let selectedNeurons: NeuronInfo[] | undefined;

  const steps: Steps = [
    {
      name: "SelectNeurons",
      showBackButton: false,
      title: $i18n.neurons.merge_neurons_modal_title,
    },
    {
      name: "ConfirmMerge",
      showBackButton: true,
      title: $i18n.neurons.merge_neurons_modal_confirm,
    },
  ];

  let currentStep: Step | undefined;
  let modal: WizardModal;

  const dispatcher = createEventDispatcher();
  const invalidStates: InvalidState<NeuronInfo[]>[] = [
    {
      stepName: "ConfirmMerge",
      isInvalid: (s?: NeuronInfo[]) =>
        s === undefined || s.length !== MAX_NEURONS_MERGED,
      onInvalid: () => {
        toastsStore.error({
          labelKey: "error.unknown",
        });
        dispatcher("nnsClose");
      },
    },
  ];
  $: checkInvalidState({
    invalidStates,
    currentStep,
    args: selectedNeurons,
  });

  const handleNeuronSelection = ({
    detail,
  }: CustomEvent<{ neurons: NeuronInfo[] }>) => {
    selectedNeurons = detail.neurons;
    modal.next();
  };
</script>

<WizardModal {steps} bind:currentStep bind:this={modal} on:nnsClose>
  <svelte:fragment slot="title"
    >{currentStep?.title ??
      $i18n.neurons.merge_neurons_modal_title}</svelte:fragment
  >
  {#if currentStep?.name === "SelectNeurons"}
    <SelectNeurons neuronsData={neurons} on:nnsSelect={handleNeuronSelection} />
  {/if}
  {#if currentStep?.name === "ConfirmMerge"}
    {#if selectedNeurons !== undefined}
      <ConfirmNeuronsMerge neurons={selectedNeurons} />
    {/if}
  {/if}
</WizardModal>

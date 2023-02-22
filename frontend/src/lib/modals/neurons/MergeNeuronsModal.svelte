<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import {
    WizardModal,
    type WizardSteps,
    type WizardStep,
  } from "@dfinity/gix-components";
  import SelectNeuronsToMerge from "$lib/components/neurons/SelectNeuronsToMerge.svelte";
  import ConfirmNeuronsMerge from "$lib/components/neurons/ConfirmNeuronsMerge.svelte";
  import type { NeuronInfo } from "@dfinity/nns";
  import {
    checkInvalidState,
    type InvalidState,
  } from "$lib/utils/neuron.utils";
  import { toastsError } from "$lib/stores/toasts.store";
  import { createEventDispatcher } from "svelte";
  import { MAX_NEURONS_MERGED } from "$lib/constants/neurons.constants";

  let selectedNeurons: NeuronInfo[] | undefined;

  const steps: WizardSteps = [
    {
      name: "SelectNeurons",
      title: $i18n.neurons.merge_neurons_modal_title,
    },
    {
      name: "ConfirmMerge",
      title: $i18n.neurons.merge_neurons_modal_confirm,
    },
  ];

  let currentStep: WizardStep | undefined;
  let modal: WizardModal;

  const dispatcher = createEventDispatcher();
  const invalidStates: InvalidState<NeuronInfo[]>[] = [
    {
      stepName: "ConfirmMerge",
      isInvalid: (s?: NeuronInfo[]) =>
        s === undefined || s.length !== MAX_NEURONS_MERGED,
      onInvalid: () => {
        toastsError({
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
    <SelectNeuronsToMerge on:nnsSelect={handleNeuronSelection} on:nnsClose />
  {/if}
  {#if currentStep?.name === "ConfirmMerge"}
    {#if selectedNeurons !== undefined}
      <ConfirmNeuronsMerge
        neurons={selectedNeurons}
        on:nnsClose
        on:nnsBack={modal.back}
      />
    {/if}
  {/if}
</WizardModal>

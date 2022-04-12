<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import WizardModal from "../WizardModal.svelte";
  import type { Step, Steps } from "../../stores/steps.state";
  import SelectTwoNeurons from "../../components/neurons/SelectTwoNeurons.svelte";
  import ConfirmNeuronsMerge from "../../components/neurons/ConfirmNeuronsMerge.svelte";
  import type { NeuronInfo } from "@dfinity/nns";
  import { neuronsStore } from "../../stores/neurons.store";
  import { mergeableNeurons } from "../../utils/neuron.utils";
  import { toastsStore } from "../../stores/toasts.store";
  import { createEventDispatcher } from "svelte";

  let neurons: NeuronInfo[];
  $: neurons = mergeableNeurons($neuronsStore);

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

  type InvalidState = {
    stepName: string;
    isSelectionValid?: (s?: NeuronInfo[]) => boolean;
  };
  const invalidStates: InvalidState[] = [
    {
      stepName: "ConfirmMerge",
      isSelectionValid: (s?: NeuronInfo[]) => s === undefined || s.length !== 2,
    },
  ];
  const dispatcher = createEventDispatcher();
  $: {
    const invalidState = invalidStates.find(
      ({ stepName, isSelectionValid }) =>
        stepName === currentStep?.name &&
        (isSelectionValid?.(selectedNeurons) ?? false)
    );
    if (invalidState !== undefined) {
      toastsStore.error({
        labelKey: "error.unknown",
      });
      dispatcher("nnsClose");
    }
  }

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
    <SelectTwoNeurons {neurons} on:nnsSelect={handleNeuronSelection} />
  {/if}
  {#if currentStep?.name === "ConfirmMerge"}
    {#if selectedNeurons !== undefined}
      <ConfirmNeuronsMerge neurons={selectedNeurons} />
    {/if}
  {/if}
</WizardModal>

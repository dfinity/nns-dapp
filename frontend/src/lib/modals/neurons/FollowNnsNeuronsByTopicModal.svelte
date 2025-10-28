<script lang="ts">
  import { definedNeuronsStore } from "$lib/derived/neurons.derived";
  import FollowNnsNeuronsByTopicStepNeuron from "$lib/modals/neurons/FollowNnsNeuronsByTopicStepNeuron.svelte";
  import FollowNnsNeuronsByTopicStepTopics from "$lib/modals/neurons/FollowNnsNeuronsByTopicStepTopics.svelte";
  import { i18n } from "$lib/stores/i18n";
  import {
    WizardModal,
    wizardStepIndex,
    type WizardStep,
    type WizardSteps,
  } from "@dfinity/gix-components";
  import { Topic, type NeuronId } from "@dfinity/nns";

  type Props = {
    neuronId: NeuronId;
    onClose: () => void;
  };
  const { neuronId, onClose }: Props = $props();

  const STEP_TOPICS = "topics";
  const STEP_NEURON = "neuron";

  const steps: WizardSteps = [
    {
      name: STEP_TOPICS,
      title: $i18n.follow_sns_topics.topics_title,
    },
    {
      name: STEP_NEURON,
      title: $i18n.follow_sns_topics.neuron_title,
    },
  ];

  const neuron = $derived(
    $definedNeuronsStore.find(({ neuronId: id }) => id === neuronId)
  )!;

  let currentStep: WizardStep | undefined = $state();
  let modal: WizardModal<string> | undefined = $state();
  let selectedTopics = $state<Topic[]>([]);

  const openNextStep = () => {
    modal?.set(wizardStepIndex({ name: STEP_NEURON, steps }));
  };

  const openFirstStep = () => {
    modal?.set(wizardStepIndex({ name: STEP_TOPICS, steps }));
  };
</script>

<WizardModal
  testId="follow-nns-neurons-by-topic-modal"
  {steps}
  bind:currentStep
  bind:this={modal}
  {onClose}
>
  {#snippet title()}{currentStep?.title}{/snippet}

  {#if currentStep?.name === STEP_TOPICS}
    <FollowNnsNeuronsByTopicStepTopics
      {neuron}
      bind:selectedTopics
      {onClose}
      {openNextStep}
    />
  {/if}

  {#if currentStep?.name === STEP_NEURON}
    <FollowNnsNeuronsByTopicStepNeuron
      {neuron}
      topics={selectedTopics}
      bind:selectedTopics
      openPrevStep={openFirstStep}
    />
  {/if}
</WizardModal>

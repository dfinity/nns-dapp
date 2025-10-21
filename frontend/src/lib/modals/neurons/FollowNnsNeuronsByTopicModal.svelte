<script lang="ts">
  import FollowNnsNeuronsByTopicStepTopics from "$lib/modals/neurons/FollowNnsNeuronsByTopicStepTopics.svelte";
  import { i18n } from "$lib/stores/i18n";
  import {
    WizardModal,
    wizardStepIndex,
    type WizardStep,
    type WizardSteps,
  } from "@dfinity/gix-components";
  import { Topic, type NeuronId } from "@dfinity/nns";
  import { onMount } from "svelte";
  import { listKnownNeurons } from "$lib/services/known-neurons.services";
  import { definedNeuronsStore } from "$lib/derived/neurons.derived";

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

  // Load KnownNeurons which are used in the FollowNnsTopicSections
  onMount(listKnownNeurons);

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

  const openPrevStep = () => {
    openFirstStep();
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
    <div
      class="under-construction"
      data-tid="follow-nns-neurons-by-topic-step-neuron-component"
    >
      <h3>Under Construction</h3>

      <h4>Selected Topics:</h4>
      {#each selectedTopics as topic}
        <li>{topic}</li>
      {/each}

      <div class="toolbar">
        <button
          class="secondary"
          type="button"
          data-tid="back-button"
          onclick={openPrevStep}
        >
          {$i18n.core.back}
        </button>

        <button
          class="primary"
          type="button"
          data-tid="confirm-button"
          disabled
        >
          Add Followee
        </button>
      </div>
    </div>
  {/if}
</WizardModal>

<style lang="scss">
  .selected-topics {
    text-align: left;

    h4 {
      margin-bottom: var(--padding);
    }

    ul {
      list-style-type: disc;
      padding-left: var(--padding-2x);

      li {
        margin-bottom: var(--padding-0_5x);
      }
    }
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    margin-top: var(--padding-2x);
  }
</style>

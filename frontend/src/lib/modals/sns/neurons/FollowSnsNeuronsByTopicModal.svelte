<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import {
    WizardModal,
    type WizardStep,
    type WizardSteps,
  } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";
  import FollowSnsNeuronsByTopicStepTopics from "$lib/modals/sns/neurons/FollowSnsNeuronsByTopicStepTopics.svelte";
  import FollowSnsNeuronsByTopicStepNeuron from "$lib/modals/sns/neurons/FollowSnsNeuronsByTopicStepNeuron.svelte";
  import type {
    ListTopicsResponseWithUnknown,
    TopicInfoWithUnknown,
  } from "$lib/types/sns-aggregator";
  import { snsTopicsStore } from "$lib/derived/sns-topics.derived";
  import type { Principal } from "@dfinity/principal";
  import { fromDefinedNullable, isNullish } from "@dfinity/utils";
  import type { SnsTopicKey } from "$lib/types/sns";
  import { startBusy, stopBusy } from "../../../stores/busy.store";

  export let rootCanisterId: Principal;

  // WIP: reflect the neuron followees
  // export let neuron: SnsNeuron;
  // export let neuronId: SnsNeuronId;
  // const neuronFollowees = neuron.topic_followees

  const dispatcher = createEventDispatcher();
  const STEP_TOPICS = "topics";
  const STEP_NEURON = "neurons";
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
  let currentStep: WizardStep | undefined = undefined;
  let modal: WizardModal;
  const next = () => modal?.next();
  const back = () => modal?.back();
  const close = () => dispatcher("nnsClose");

  let listTopics: ListTopicsResponseWithUnknown | undefined;
  $: listTopics = $snsTopicsStore[rootCanisterId.toText()];

  let topicInfos: TopicInfoWithUnknown[];
  $: topicInfos = isNullish(listTopics)
    ? []
    : fromDefinedNullable(listTopics?.topics);

  let selectedTopics: SnsTopicKey[] = [];

  const onConfirm = async ({
    detail: { followeeHex },
  }: {
    detail: { followeeHex: string };
  }) => {
    startBusy({ initiator: "add-followee-by-topic" });

    // TODO: replace with the actual api call
    console.error("TBD: follow SNS neurons by topic", {
      selectedTopics,
      followeeHex,
    });
    await new Promise((resolve) => setTimeout(resolve, 2000));

    stopBusy("add-followee-by-topic");
  };
</script>

<WizardModal
  testId="follow-sns-neurons-by-topic-modal"
  {steps}
  bind:currentStep
  bind:this={modal}
  on:nnsClose={close}
>
  <svelte:fragment slot="title">{currentStep?.title}</svelte:fragment>

  {#if currentStep?.name === STEP_TOPICS}
    <FollowSnsNeuronsByTopicStepTopics
      {topicInfos}
      bind:selectedTopics
      on:nnsClose={close}
      on:nnsNext={next}
    />
  {/if}
  {#if currentStep?.name === STEP_NEURON}
    <FollowSnsNeuronsByTopicStepNeuron
      on:nnsBack={back}
      on:nnsConfirm={onConfirm}
    />
  {/if}
</WizardModal>

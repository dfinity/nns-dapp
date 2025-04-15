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
  import type { SnsTopicFollowing, SnsTopicKey } from "$lib/types/sns";
  import type { SnsNeuron, SnsNeuronId } from "@dfinity/sns";
  import { getSnsTopicFollowings } from "$lib/utils/sns-topics.utils";

  type Props = {
    rootCanisterId: Principal;
    neuron: SnsNeuron;
    reloadNeuron: () => Promise<void>;
  };
  const { rootCanisterId, neuron, reloadNeuron }: Props = $props();

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
  let currentStep: WizardStep | undefined = $state();
  let modal: WizardModal | undefined = $state();
  const openNextStep = () => modal?.next();
  const openPrevStep = () => modal?.back();
  const closeModal = () => dispatcher("nnsClose");

  const listTopics: ListTopicsResponseWithUnknown | undefined = $derived(
    $snsTopicsStore[rootCanisterId.toText()]
  );
  const topicInfos: TopicInfoWithUnknown[] = $derived(
    isNullish(listTopics) ? [] : fromDefinedNullable(listTopics?.topics)
  );
  const followings: SnsTopicFollowing[] = $derived(
    getSnsTopicFollowings(neuron)
  );
  let selectedTopics: SnsTopicKey[] = $state([]);
  let followeeNeuronIdHex: string = $state("");

  const addFollowing = async (followeeHex: string) => {
    console.error("TBD addFollowing", followeeHex);
    await reloadNeuron();
  };

  const removeFollowing = async ({
    topicKey,
    neuronId,
  }: {
    topicKey: SnsTopicKey;
    neuronId: SnsNeuronId;
  }) => {
    console.error("TBD removeFollowing", topicKey, neuronId);
    await reloadNeuron();
  };
</script>

<WizardModal
  testId="follow-sns-neurons-by-topic-modal"
  {steps}
  bind:currentStep
  bind:this={modal}
  on:nnsClose
>
  <svelte:fragment slot="title">{currentStep?.title}</svelte:fragment>

  {#if currentStep?.name === STEP_TOPICS}
    <FollowSnsNeuronsByTopicStepTopics
      {topicInfos}
      {followings}
      bind:selectedTopics
      {closeModal}
      {openNextStep}
      {removeFollowing}
    />
  {/if}
  {#if currentStep?.name === STEP_NEURON}
    <FollowSnsNeuronsByTopicStepNeuron
      bind:followeeHex={followeeNeuronIdHex}
      {openPrevStep}
      {addFollowing}
    />
  {/if}
</WizardModal>

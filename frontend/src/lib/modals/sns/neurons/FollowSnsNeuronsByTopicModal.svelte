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
  import {
    arrayOfNumberToUint8Array,
    fromDefinedNullable,
    isNullish,
  } from "@dfinity/utils";
  import type { SnsTopicKey } from "$lib/types/sns";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import type { SnsNeuron, SnsNeuronId } from "@dfinity/sns";
  import {
    getSnsNeuronIdentity,
    setFollowing,
  } from "$lib/services/sns-neurons.services";
  import { toastsError, toastsSuccess } from "$lib/stores/toasts.store";
  import {
    getSnsTopicFollowings,
    insertIntoSnsTopicFollowings,
  } from "$lib/utils/sns-topics.utils";
  import { hexStringToBytes } from "$lib/utils/utils";
  import { querySnsNeuron } from "$lib/api/sns-governance.api";

  export let rootCanisterId: Principal;
  export let neuron: SnsNeuron;

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
  let followeeNeuronIdHex: string = "";

  // Validate the followee neuron id by fetching it.
  const validateNeuronId = async (neuronId: SnsNeuronId) => {
    const identity = await getSnsNeuronIdentity();
    return (
      (await querySnsNeuron({
        identity,
        rootCanisterId,
        neuronId,
        certified: false,
      })) !== undefined
    );
  };

  const onConfirm = async (followeeHex: string) => {
    const followeeNeuronId: SnsNeuronId = {
      id: arrayOfNumberToUint8Array(hexStringToBytes(followeeHex)),
    };

    if (await !validateNeuronId(followeeNeuronId)) {
      toastsError({
        labelKey: "follow_sns_topics.followee_does_not_exist",
        substitutions: {
          $neuronId: followeeHex,
        },
      });
      return;
    }

    startBusy({ initiator: "add-followee-by-topic" });

    try {
      const followings = insertIntoSnsTopicFollowings({
        followings: getSnsTopicFollowings(neuron),
        topicsToFollow: selectedTopics,
        neuronId: fromDefinedNullable(neuron.id),
      });
      const { success } = await setFollowing({
        rootCanisterId,
        neuronId: neuron.id,
        followings,
      });
      if (success) {
        toastsSuccess({
          labelKey: $i18n.follow_sns_topics.success,
        });
        close();
      }
    } catch (error) {
      console.error("Failed to follow SNS neurons by topic", error);
      toastsError({
        labelKey: "new_followee.followee_does_not_exist",
        substitutions: {
          $neuronId: followeeHex,
        },
      });
    }

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
      onNnsClose={close}
      onNnsNext={next}
    />
  {/if}
  {#if currentStep?.name === STEP_NEURON}
    <FollowSnsNeuronsByTopicStepNeuron
      bind:followeeHex={followeeNeuronIdHex}
      onNnsBack={back}
      onNnsConfirm={onConfirm}
    />
  {/if}
</WizardModal>

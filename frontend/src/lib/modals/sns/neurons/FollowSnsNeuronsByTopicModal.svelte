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
    nonNullish,
  } from "@dfinity/utils";
  import type {
    SnsTopicFollowee,
    SnsTopicFollowing,
    SnsTopicKey,
  } from "$lib/types/sns";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import type { SnsNeuron, SnsNeuronId } from "@dfinity/sns";
  import {
    getSnsNeuronIdentity,
    setFollowing,
  } from "$lib/services/sns-neurons.services";
  import { toastsError, toastsSuccess } from "$lib/stores/toasts.store";
  import { getSnsTopicFollowings } from "$lib/utils/sns-topics.utils";
  import { hexStringToBytes } from "$lib/utils/utils";
  import { querySnsNeuron } from "$lib/api/sns-governance.api";
  import { subaccountToHexString } from "$lib/utils/sns-neuron.utils";

  interface Props {
    rootCanisterId: Principal;
    neuron: SnsNeuron;
  }
  let { rootCanisterId, neuron }: Props = $props();

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
  const next = () => modal?.next();
  const back = () => modal?.back();
  const close = () => dispatcher("nnsClose");

  let listTopics: ListTopicsResponseWithUnknown | undefined = $derived(
    $snsTopicsStore[rootCanisterId.toText()]
  );
  let topicInfos: TopicInfoWithUnknown[] = $derived(
    isNullish(listTopics) ? [] : fromDefinedNullable(listTopics?.topics)
  );
  let followings: SnsTopicFollowing[] = $derived(getSnsTopicFollowings(neuron));
  let selectedTopics: SnsTopicKey[] = $state([]);
  let followeeNeuronIdHex: string = $state("");

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

    if (!(await validateNeuronId(followeeNeuronId))) {
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
      // Combine the neuron’s followees with the new followee for selected topics
      // (if the neuron is already following the followee, do not add it again).
      const requestFollowings: SnsTopicFollowing[] = selectedTopics
        .map((topicKey) => {
          const topicFollowees: SnsTopicFollowee[] =
            followings.find((following) => following.topic === topicKey)
              ?.followees ?? [];
          const isAlreadyFollowed = topicFollowees.find(
            (followee) =>
              subaccountToHexString(followee.neuronId.id) === followeeHex
          );
          return isAlreadyFollowed
            ? null
            : {
                topic: topicKey,
                followees: [
                  ...topicFollowees,
                  {
                    neuronId: followeeNeuronId,
                  },
                ],
              };
        })
        .filter(nonNullish);
      const { success } = await setFollowing({
        rootCanisterId,
        neuronId: fromDefinedNullable(neuron.id),
        followings: requestFollowings,
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
  const onNnsRemove = ({
    topicKey,
    neuronId,
  }: {
    topicKey: SnsTopicKey;
    neuronId: SnsNeuronId;
  }) => {
    console.log("remove", topicKey, subaccountToHexString(neuronId.id));
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
      {followings}
      bind:selectedTopics
      onNnsClose={close}
      onNnsNext={next}
      {onNnsRemove}
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

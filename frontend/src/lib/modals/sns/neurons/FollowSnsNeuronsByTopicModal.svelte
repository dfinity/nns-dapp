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
  import type { SnsTopicFollowing, SnsTopicKey } from "$lib/types/sns";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import type { SnsNeuron, SnsNeuronId } from "@dfinity/sns";
  import {
    getSnsNeuronIdentity,
    setFollowing,
  } from "$lib/services/sns-neurons.services";
  import { toastsError, toastsSuccess } from "$lib/stores/toasts.store";
  import {
    addSnsNeuronToFollowingsByTopics,
    getSnsTopicFollowings,
    removeSnsNeuronFromFollowingsByTopics,
  } from "$lib/utils/sns-topics.utils";
  import { hexStringToBytes } from "$lib/utils/utils";
  import { querySnsNeuron } from "$lib/api/sns-governance.api";

  interface Props {
    rootCanisterId: Principal;
    neuron: SnsNeuron;
    reloadNeuron: () => Promise<void>;
  }
  let { rootCanisterId, neuron, reloadNeuron }: Props = $props();

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
    const neuronId: SnsNeuronId = {
      id: arrayOfNumberToUint8Array(hexStringToBytes(followeeHex)),
    };

    startBusy({ initiator: "add-followee-by-topic" });

    if (!(await validateNeuronId(neuronId))) {
      stopBusy("add-followee-by-topic");
      toastsError({
        labelKey: "follow_sns_topics.error_neuron_not_exist",
        substitutions: {
          $neuronId: followeeHex,
        },
      });
      return;
    }

    try {
      const { success } = await setFollowing({
        rootCanisterId,
        neuronId: fromDefinedNullable(neuron.id),
        followings: addSnsNeuronToFollowingsByTopics({
          topics: selectedTopics,
          neuronId: neuronId,
          followings,
        }),
      });

      if (success) {
        toastsSuccess({
          labelKey: $i18n.follow_sns_topics.success_set_following,
        });
        await reloadNeuron();
        close();
      }
    } catch (error) {
      console.error("Failed to follow SNS neurons by topic", error);
      toastsError({
        labelKey: "new_followee.error_set_following",
      });
    }

    stopBusy("add-followee-by-topic");
  };

  const onNnsRemove = async ({
    topicKey,
    neuronId,
  }: {
    topicKey: SnsTopicKey;
    neuronId: SnsNeuronId;
  }) => {
    startBusy({ initiator: "add-followee-by-topic" });

    try {
      const { success } = await setFollowing({
        rootCanisterId,
        neuronId: fromDefinedNullable(neuron.id),
        followings: removeSnsNeuronFromFollowingsByTopics({
          followings,
          topics: [topicKey],
          neuronId,
        }),
      });

      if (success) {
        toastsSuccess({
          labelKey: $i18n.follow_sns_topics.error_remove_following,
        });
        await reloadNeuron();
      }
    } catch (error) {
      console.error("Failed to remove SNS followee by topic", error);
      toastsError({
        labelKey: "new_followee.error_remove_following",
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

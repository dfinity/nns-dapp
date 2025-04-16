<script lang="ts">
  import { querySnsNeuron } from "$lib/api/sns-governance.api";
  import { snsTopicsStore } from "$lib/derived/sns-topics.derived";
  import FollowSnsNeuronsByTopicStepNeuron from "$lib/modals/sns/neurons/FollowSnsNeuronsByTopicStepNeuron.svelte";
  import FollowSnsNeuronsByTopicStepTopics from "$lib/modals/sns/neurons/FollowSnsNeuronsByTopicStepTopics.svelte";
  import {
    getSnsNeuronIdentity,
    setFollowing,
  } from "$lib/services/sns-neurons.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsError, toastsSuccess } from "$lib/stores/toasts.store";
  import type { SnsTopicFollowing, SnsTopicKey } from "$lib/types/sns";
  import type {
    ListTopicsResponseWithUnknown,
    TopicInfoWithUnknown,
  } from "$lib/types/sns-aggregator";
  import {
    addSnsNeuronToFollowingsByTopics,
    getSnsTopicFollowings,
  } from "$lib/utils/sns-topics.utils";
  import { hexStringToBytes } from "$lib/utils/utils";
  import {
    WizardModal,
    type WizardStep,
    type WizardSteps,
  } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import type { SnsNeuron, SnsNeuronId } from "@dfinity/sns";
  import {
    arrayOfNumberToUint8Array,
    fromDefinedNullable,
    isNullish,
  } from "@dfinity/utils";

  type Props = {
    rootCanisterId: Principal;
    neuron: SnsNeuron;
    closeModal: () => void;
    reloadNeuron: () => Promise<void>;
  };
  const { rootCanisterId, neuron, closeModal, reloadNeuron }: Props = $props();

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

  const listTopics: ListTopicsResponseWithUnknown | undefined = $derived(
    $snsTopicsStore[rootCanisterId.toText()]
  );
  const topicInfos: TopicInfoWithUnknown[] = $derived(
    isNullish(listTopics) ? [] : fromDefinedNullable(listTopics?.topics)
  );
  const followings: SnsTopicFollowing[] = $derived(
    getSnsTopicFollowings(neuron)
  );
  let selectedTopics = $state<SnsTopicKey[]>([]);
  let followeeNeuronIdHex = $state<string>("");

  // Validate the followee neuron id by fetching it.
  const validateNeuronId = async (neuronId: SnsNeuronId) => {
    try {
      const identity = await getSnsNeuronIdentity();
      return (
        (await querySnsNeuron({
          identity,
          rootCanisterId,
          neuronId,
          certified: false,
        })) !== undefined
      );
    } catch (_) {
      return false;
    }
  };

  const addFollowing = async (followeeHex: string) => {
    const followeeNeuronId: SnsNeuronId = {
      id: arrayOfNumberToUint8Array(hexStringToBytes(followeeHex)),
    };

    startBusy({
      initiator: "add-followee-by-topic",
      labelKey: "follow_sns_topics.busy_updating",
    });

    if (!(await validateNeuronId(followeeNeuronId))) {
      stopBusy("add-followee-by-topic");
      toastsError({
        labelKey: "follow_sns_topics.error_neuron_not_exist",
        substitutions: {
          $neuronId: followeeHex,
        },
      });
      return;
    }

    const { success } = await setFollowing({
      rootCanisterId,
      neuronId: fromDefinedNullable(neuron.id),
      followings: addSnsNeuronToFollowingsByTopics({
        topics: selectedTopics,
        neuronId: followeeNeuronId,
        followings,
      }),
    });

    if (success) {
      toastsSuccess({
        labelKey: $i18n.follow_sns_topics.success_set_following,
      });
      await reloadNeuron();
      closeModal();
    }

    stopBusy("add-followee-by-topic");
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

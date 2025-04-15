<script lang="ts">
  import { querySnsNeuron } from "$lib/api/sns-governance.api";
  import { snsTopicsStore } from "$lib/derived/sns-topics.derived";
  import FollowSnsNeuronsByTopicStepNeuron from "$lib/modals/sns/neurons/FollowSnsNeuronsByTopicStepNeuron.svelte";
  import FollowSnsNeuronsByTopicStepTopics from "$lib/modals/sns/neurons/FollowSnsNeuronsByTopicStepTopics.svelte";
  import {
    getSnsNeuronIdentity,
    removeFollowee,
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
    removeSnsNeuronFromFollowingsByTopics,
  } from "$lib/utils/sns-topics.utils";
  import { hexStringToBytes } from "$lib/utils/utils";
  import {
    WizardModal,
    type WizardStep,
    type WizardSteps,
  } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import type {
    SnsNervousSystemFunction,
    SnsNeuron,
    SnsNeuronId,
  } from "@dfinity/sns";
  import {
    arrayOfNumberToUint8Array,
    fromDefinedNullable,
    isNullish,
  } from "@dfinity/utils";

  type Props = {
    rootCanisterId: Principal;
    neuron: SnsNeuron;
    closeModal: () => undefined;
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
  let selectedTopics: SnsTopicKey[] = $state([]);
  let followeeNeuronIdHex: string = $state("");

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
    const neuronId: SnsNeuronId = {
      id: arrayOfNumberToUint8Array(hexStringToBytes(followeeHex)),
    };

    startBusy({
      initiator: "add-followee-by-topic",
      labelKey: "follow_sns_topics.busy_updating",
    });

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
        closeModal();
      }
    } catch (error) {
      console.error("Failed to follow SNS neurons by topic", error);
      toastsError({
        labelKey: "new_followee.error_set_following",
      });
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
    startBusy({
      initiator: "remove-followee-by-topic",
      labelKey: "follow_sns_topics.busy_removing",
    });

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
        await reloadNeuron();
      }
    } catch (error) {
      console.error("Failed to remove SNS followee by topic", error);
      toastsError({
        labelKey: "new_followee.error_remove_following",
      });
    }

    stopBusy("remove-followee-by-topic");
  };

  const removeLegacyFollowing = async ({
    nsFunction,
    followee,
  }: {
    nsFunction: SnsNervousSystemFunction;
    followee: SnsNeuronId;
  }) => {
    startBusy({
      initiator: "remove-sns-followee",
      labelKey: "follow_sns_topics.busy_legacy_removing",
    });

    try {
      const { success } = await removeFollowee({
        rootCanisterId,
        neuron,
        followee,
        functionId: nsFunction.id,
      });

      if (success) {
        await reloadNeuron();
      }
    } catch (error) {
      console.error("Failed to remove SNS followee", error);
      toastsError({
        labelKey: "new_followee.error_remove_following",
      });
    }

    stopBusy("remove-sns-followee");
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
      {neuron}
      bind:selectedTopics
      {closeModal}
      {openNextStep}
      {removeFollowing}
      {removeLegacyFollowing}
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

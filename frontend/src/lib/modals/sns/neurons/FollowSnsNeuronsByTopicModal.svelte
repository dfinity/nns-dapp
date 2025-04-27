<script lang="ts">
  import { querySnsNeuron } from "$lib/api/sns-governance.api";
  import { createSnsNsFunctionsProjectStore } from "$lib/derived/sns-ns-functions-project.derived";
  import { snsTopicsStore } from "$lib/derived/sns-topics.derived";
  import FollowSnsNeuronsByTopicStepDeactivateCatchAll from "$lib/modals/sns/neurons/FollowSnsNeuronsByTopicStepDeactivateCatchAll.svelte";
  import FollowSnsNeuronsByTopicStepLegacy from "$lib/modals/sns/neurons/FollowSnsNeuronsByTopicStepLegacy.svelte";
  import FollowSnsNeuronsByTopicStepNeuron from "$lib/modals/sns/neurons/FollowSnsNeuronsByTopicStepNeuron.svelte";
  import FollowSnsNeuronsByTopicStepTopics from "$lib/modals/sns/neurons/FollowSnsNeuronsByTopicStepTopics.svelte";
  import {
    getSnsNeuronIdentity,
    removeFollowee,
    removeNsFunctionFollowees,
    setFollowing,
  } from "$lib/services/sns-neurons.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsError, toastsSuccess } from "$lib/stores/toasts.store";
  import type {
    SnsLegacyFollowings,
    SnsTopicFollowing,
    SnsTopicKey,
  } from "$lib/types/sns";
  import type {
    ListTopicsResponseWithUnknown,
    TopicInfoWithUnknown,
  } from "$lib/types/sns-aggregator";
  import {
    addSnsNeuronToFollowingsByTopics,
    getCatchAllSnsLegacyFollowings,
    getLegacyFolloweesByTopics,
    getSnsTopicFollowings,
    getSnsTopicInfoKey,
    removeSnsNeuronFromFollowingsByTopics,
  } from "$lib/utils/sns-topics.utils";
  import { hexStringToBytes } from "$lib/utils/utils";
  import {
    WizardModal,
    wizardStepIndex,
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
    nonNullish,
  } from "@dfinity/utils";
  import { get } from "svelte/store";

  type Props = {
    rootCanisterId: Principal;
    neuron: SnsNeuron;
    closeModal: () => void;
    reloadNeuron: () => Promise<void>;
  };
  const { rootCanisterId, neuron, closeModal, reloadNeuron }: Props = $props();

  const STEP_TOPICS = "topics";
  const STEP_CONFIRM_OVERRIDE_LEGACY = "legacy";
  const STEP_CONFIRM_DEACTIVATING_CATCH_ALL = "catch-all";
  const STEP_NEURON = "neurons";
  const steps: WizardSteps = [
    {
      name: STEP_TOPICS,
      title: $i18n.follow_sns_topics.topics_title,
    },
    {
      name: STEP_CONFIRM_OVERRIDE_LEGACY,
      title: $i18n.follow_sns_topics.legacy_title,
    },
    {
      name: STEP_CONFIRM_DEACTIVATING_CATCH_ALL,
      title: $i18n.follow_sns_topics.deactivate_catch_all_title,
    },
    {
      name: STEP_NEURON,
      title: $i18n.follow_sns_topics.neuron_title,
    },
  ];
  let currentStep: WizardStep | undefined = $state();
  let modal: WizardModal | undefined = $state();
  const openNextStep = () => {
    if (
      currentStep?.name === STEP_TOPICS &&
      selectedTopicsContainLegacyFollowee
    ) {
      modal?.set(
        wizardStepIndex({ name: STEP_CONFIRM_OVERRIDE_LEGACY, steps })
      );
    } else {
      modal?.set(wizardStepIndex({ name: STEP_NEURON, steps }));
    }
  };
  const openDeactivateCatchAllStep = () =>
    modal?.set(
      wizardStepIndex({ name: STEP_CONFIRM_DEACTIVATING_CATCH_ALL, steps })
    );
  const openPrevStep = () => {
    if (
      currentStep?.name === STEP_NEURON &&
      selectedTopicsContainLegacyFollowee
    ) {
      modal?.set(
        wizardStepIndex({ name: STEP_CONFIRM_OVERRIDE_LEGACY, steps })
      );
    } else {
      modal?.set(wizardStepIndex({ name: STEP_TOPICS, steps }));
    }
  };

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

  const nsFunctions: SnsNervousSystemFunction[] = $derived(
    get(createSnsNsFunctionsProjectStore(rootCanisterId)) ?? []
  );
  const catchAllLegacyFollowings = $derived<SnsLegacyFollowings | undefined>(
    getCatchAllSnsLegacyFollowings({
      neuron,
      nsFunctions,
    })
  );

  const selectedTopicsContainLegacyFollowee = $derived<boolean>(
    getLegacyFolloweesByTopics({
      neuron,
      topicInfos: topicInfos.filter((topicInfo) =>
        selectedTopics.includes(getSnsTopicInfoKey(topicInfo))
      ),
    }).length > 0
  );

  // Validate the followee neuron id by fetching it.
  const validateNeuronId = async (neuronId: SnsNeuronId) => {
    try {
      return nonNullish(
        await querySnsNeuron({
          identity: await getSnsNeuronIdentity(),
          rootCanisterId,
          neuronId,
          certified: false,
        })
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

    const { success, error } = await setFollowing({
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
    } else {
      toastsError({
        labelKey: "follow_sns_topics.error_add_following",
        err: error,
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

    const { success, error } = await setFollowing({
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
    } else {
      toastsError({
        labelKey: "follow_sns_topics.error_remove_following",
        err: error,
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
      initiator: "remove-sns-legacy-followee",
      labelKey: "follow_sns_topics.busy_removing_legacy",
    });
    const { success } = await removeFollowee({
      rootCanisterId,
      neuron,
      followee,
      functionId: nsFunction.id,
    });
    if (success) {
      await reloadNeuron();
      toastsSuccess({
        labelKey: "follow_sns_topics.success_removing_legacy",
      });
    }
    stopBusy("remove-sns-legacy-followee");
  };

  const confirmDeactivateCatchAllFollowee = async () => {
    // TODO(sns-topics): Implement deactivation of catch-all followee
  };
</script>

<WizardModal
  testId="follow-sns-neurons-by-topic-modal"
  {steps}
  bind:currentStep
  bind:this={modal}
  on:nnsClose={closeModal}
>
  <svelte:fragment slot="title">{currentStep?.title}</svelte:fragment>

  {#if currentStep?.name === STEP_TOPICS}
    <FollowSnsNeuronsByTopicStepTopics
      {topicInfos}
      {followings}
      {neuron}
      bind:selectedTopics
      {catchAllLegacyFollowings}
      {closeModal}
      {openNextStep}
      {openDeactivateCatchAllStep}
      {removeFollowing}
      {removeLegacyFollowing}
    />
  {/if}
  {#if currentStep?.name === STEP_CONFIRM_OVERRIDE_LEGACY}
    <FollowSnsNeuronsByTopicStepLegacy
      {topicInfos}
      {neuron}
      bind:selectedTopics
      {openPrevStep}
      {openNextStep}
    />
  {/if}
  {#if currentStep?.name === STEP_CONFIRM_DEACTIVATING_CATCH_ALL && nonNullish(catchAllLegacyFollowings)}
    <FollowSnsNeuronsByTopicStepDeactivateCatchAll
      {catchAllLegacyFollowings}
      cancel={openPrevStep}
      confirm={confirmDeactivateCatchAllFollowee}
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

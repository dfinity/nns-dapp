<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import FollowSnsNeuronsByTopicItem from "$lib/modals/sns/neurons/FollowSnsNeuronsByTopicItem.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type {
    SnsLegacyFollowings,
    SnsTopicFollowing,
    SnsTopicKey,
  } from "$lib/types/sns";
  import type { TopicInfoWithUnknown } from "$lib/types/sns-aggregator";
  import {
    getSnsTopicInfoKey,
    getLegacyFolloweesByTopics,
    snsTopicToTopicKey,
  } from "$lib/utils/sns-topics.utils";
  import type {
    SnsNervousSystemFunction,
    SnsNeuron,
    SnsNeuronId,
  } from "@dfinity/sns";
  import { fromDefinedNullable, nonNullish } from "@dfinity/utils";

  type Props = {
    neuron: SnsNeuron;
    topicInfos: TopicInfoWithUnknown[];
    selectedTopics: SnsTopicKey[];
    followings: SnsTopicFollowing[];
    catchAllLegacyFollowings: SnsLegacyFollowings | undefined;
    closeModal: () => void;
    openNextStep: () => void;
    removeFollowing: (args: {
      topicKey: SnsTopicKey;
      neuronId: SnsNeuronId;
    }) => void;
    removeLegacyFollowing: (args: {
      nsFunction: SnsNervousSystemFunction;
      followee: SnsNeuronId;
    }) => void;
    openDeactivateCatchAllStep: () => void;
  };
  let {
    neuron,
    topicInfos,
    selectedTopics = $bindable(),
    followings,
    catchAllLegacyFollowings,
    closeModal,
    openNextStep,
    removeFollowing,
    removeLegacyFollowing,
    openDeactivateCatchAllStep,
  }: Props = $props();

  const criticalTopicInfos: TopicInfoWithUnknown[] = $derived(
    topicInfos.filter((topicInfo) => fromDefinedNullable(topicInfo.is_critical))
  );
  const nonCriticalTopicInfos: TopicInfoWithUnknown[] = $derived(
    topicInfos.filter(
      (topicInfo) => !fromDefinedNullable(topicInfo.is_critical)
    )
  );

  const onTopicSelectionChange = ({
    topicKey,
    checked,
  }: {
    topicKey: SnsTopicKey;
    checked: boolean;
  }) => {
    if (checked) {
      selectedTopics = [...selectedTopics, topicKey];
    } else {
      selectedTopics = selectedTopics.filter((key) => key !== topicKey);
    }
  };
  const isTopicInfoSelected = (topicInfo: TopicInfoWithUnknown) =>
    selectedTopics.includes(getSnsTopicInfoKey(topicInfo));
  const getTopicFollowees = (topicInfo: TopicInfoWithUnknown) =>
    followings.find(
      (following) =>
        snsTopicToTopicKey(fromDefinedNullable(topicInfo.topic)) ===
        following.topic
    )?.followees ?? [];

  const getNonCriticalLegacyFolloweesByTopics = (
    topicInfo: TopicInfoWithUnknown
  ) =>
    [
      catchAllLegacyFollowings,
      ...getLegacyFolloweesByTopics({
        neuron,
        topicInfos: [topicInfo],
      }),
    ].filter(nonNullish);
</script>

<TestIdWrapper testId="follow-sns-neurons-by-topic-step-topics-component">
  <p class="description">{$i18n.follow_sns_topics.topics_description}</p>

  <Separator spacing="medium" />

  <div class="topic-group" data-tid="critical-topic-group">
    <h5 class="headline description"
      >{$i18n.follow_sns_topics.topics_critical_label}
      <TooltipIcon
        >{$i18n.follow_sns_topics.topics_critical_tooltip}</TooltipIcon
      ></h5
    >
    {#each criticalTopicInfos as topicInfo}
      <FollowSnsNeuronsByTopicItem
        {topicInfo}
        followees={getTopicFollowees(topicInfo)}
        legacyFollowees={getLegacyFolloweesByTopics({
          neuron,
          topicInfos: [topicInfo],
        })}
        checked={isTopicInfoSelected(topicInfo)}
        onNnsChange={onTopicSelectionChange}
        {removeFollowing}
        {removeLegacyFollowing}
      />
    {/each}
  </div>

  <div class="topic-group" data-tid="non-critical-topic-group">
    <div class="topic-group-header">
      <h5 class="headline description"
        >{$i18n.follow_sns_topics.topics_non_critical_label}
        <TooltipIcon
          >{$i18n.follow_sns_topics.topics_critical_tooltip}</TooltipIcon
        ></h5
      >
      {#if nonNullish(catchAllLegacyFollowings)}
        <button
          data-tid="deactivate-catch-all-button"
          class="ghost"
          onclick={openDeactivateCatchAllStep}>{"Deactivate catch-all"}</button
        >
      {/if}
    </div>
    {#each nonCriticalTopicInfos as topicInfo}
      <FollowSnsNeuronsByTopicItem
        {topicInfo}
        followees={getTopicFollowees(topicInfo)}
        legacyFollowees={getNonCriticalLegacyFolloweesByTopics(topicInfo)}
        checked={isTopicInfoSelected(topicInfo)}
        onNnsChange={onTopicSelectionChange}
        {removeFollowing}
        {removeLegacyFollowing}
      />
    {/each}
  </div>

  <div class="toolbar">
    <button
      class="secondary"
      type="button"
      data-tid="cancel-button"
      onclick={closeModal}
    >
      {$i18n.core.cancel}
    </button>

    <button
      data-tid="next-button"
      class="primary"
      disabled={selectedTopics.length === 0}
      onclick={openNextStep}
    >
      {$i18n.core.next}
    </button>
  </div>
</TestIdWrapper>

<style lang="scss">
  .topic-group {
    margin-bottom: var(--padding-3x);
    display: flex;
    flex-direction: column;
    gap: var(--padding);

    .headline {
      margin: var(--padding) 0;
    }
  }

  .topic-group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    button {
      color: var(--primary);
    }
  }
</style>

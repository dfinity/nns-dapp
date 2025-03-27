<script lang="ts">
  import Separator from "$lib/components/ui/Separator.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { TopicInfoWithUnknown } from "$lib/types/sns-aggregator";
  import FollowSnsNeuronsByTopicStepTopicsItem from "$lib/modals/sns/neurons/FollowSnsNeuronsByTopicItem.svelte";
  import { fromDefinedNullable } from "@dfinity/utils";
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import type { SnsTopicKey } from "$lib/types/sns";
  import { getSnsTopicInfoKey } from "$lib/utils/sns-topics.utils";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";

  export let topicInfos: TopicInfoWithUnknown[];
  export let selectedTopics: SnsTopicKey[] = [];
  export let onNnsClose: () => void;
  export let onNnsNext: () => void;

  let criticalTopicInfos: TopicInfoWithUnknown[];
  $: criticalTopicInfos = topicInfos.filter((topicInfo) =>
    fromDefinedNullable(topicInfo.is_critical)
  );
  let nonCriticalTopicInfos: TopicInfoWithUnknown[];
  $: nonCriticalTopicInfos = topicInfos.filter(
    (topicInfo) => !fromDefinedNullable(topicInfo.is_critical)
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
      <FollowSnsNeuronsByTopicStepTopicsItem
        {topicInfo}
        checked={isTopicInfoSelected(topicInfo)}
        onNnsChange={onTopicSelectionChange}
      />
    {/each}
  </div>

  <div class="topic-group" data-tid="non-critical-topic-group">
    <h5 class="headline description"
      >{$i18n.follow_sns_topics.topics_non_critical_label}
      <TooltipIcon
        >{$i18n.follow_sns_topics.topics_critical_tooltip}</TooltipIcon
      ></h5
    >
    {#each nonCriticalTopicInfos as topicInfo}
      <FollowSnsNeuronsByTopicStepTopicsItem
        {topicInfo}
        checked={isTopicInfoSelected(topicInfo)}
        onNnsChange={onTopicSelectionChange}
      />
    {/each}
  </div>

  <div class="toolbar">
    <button
      class="secondary"
      type="button"
      data-tid="cancel-button"
      on:click={onNnsClose}
    >
      {$i18n.core.cancel}
    </button>

    <button
      data-tid="next-button"
      class="primary"
      disabled={selectedTopics.length === 0}
      on:click={onNnsNext}
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
</style>

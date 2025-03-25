<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Modal } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";
  import type {
    ListTopicsResponseWithUnknown,
    TopicInfoWithUnknown,
  } from "$lib/types/sns-aggregator";
  import { snsTopicsStore } from "$lib/derived/sns-topics.derived";
  import type { Principal } from "@dfinity/principal";
  import { fromDefinedNullable, isNullish } from "@dfinity/utils";
  import Separator from "$lib/components/ui/Separator.svelte";
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import SnsTopicDefinitionsTopic from "$lib/modals/sns/neurons/SnsTopicDefinitionsTopic.svelte";

  export let rootCanisterId: Principal;

  const dispatcher = createEventDispatcher();
  const close = () => dispatcher("nnsClose");

  let listTopics: ListTopicsResponseWithUnknown | undefined;
  $: listTopics = $snsTopicsStore[rootCanisterId.toText()];

  let topicInfos: TopicInfoWithUnknown[];
  $: topicInfos = isNullish(listTopics)
    ? []
    : fromDefinedNullable(listTopics?.topics);
  let criticalTopicInfos: TopicInfoWithUnknown[];
  $: criticalTopicInfos = topicInfos.filter((topicInfo) =>
    fromDefinedNullable(topicInfo.is_critical)
  );
  let nonCriticalTopicInfos: TopicInfoWithUnknown[];
  $: nonCriticalTopicInfos = topicInfos.filter(
    (topicInfo) => !fromDefinedNullable(topicInfo.is_critical)
  );
</script>

<Modal testId="sns-topic-definitions-modal-component" on:nnsClose={close}>
  <svelte:fragment slot="title"
    >{$i18n.follow_sns_topics.topic_definitions_title}</svelte:fragment
  >

  <p class="description"
    >{$i18n.follow_sns_topics.topic_definitions_description}</p
  >

  <Separator spacing="medium" />

  <div class="topic-group" data-tid="critical-topic-group">
    <h5 class="headline description"
      >{$i18n.follow_sns_topics.topics_critical_label}
      <TooltipIcon
        >{$i18n.follow_sns_topics.topics_critical_tooltip}</TooltipIcon
      ></h5
    >
    {#each criticalTopicInfos as topicInfo}
      <SnsTopicDefinitionsTopic {topicInfo} />
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
      <SnsTopicDefinitionsTopic {topicInfo} />
    {/each}
  </div>

  <div class="toolbar">
    <button
      class="secondary"
      type="button"
      data-tid="cancel-button"
      on:click={close}
    >
      {$i18n.core.close}
    </button>
  </div>
</Modal>

<style lang="scss">
  .headline {
    margin: 0;
  }

  .topic-group {
    margin-bottom: var(--padding-3x);

    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }
</style>

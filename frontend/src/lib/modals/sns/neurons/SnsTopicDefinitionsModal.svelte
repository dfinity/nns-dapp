<script lang="ts">
  import Separator from "$lib/components/ui/Separator.svelte";
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import { createSnsTopicsProjectStore } from "$lib/derived/sns-topics.derived";
  import SnsTopicDefinitionsTopic from "$lib/modals/sns/neurons/SnsTopicDefinitionsTopic.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { getSnsTopicInfoKey } from "$lib/utils/sns-topics.utils";
  import { Modal } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import { fromDefinedNullable } from "@dfinity/utils";

  type Props = {
    rootCanisterId: Principal;
    onClose: () => void;
  };

  const { rootCanisterId, onClose }: Props = $props();

  const topicsStore = $derived(createSnsTopicsProjectStore(rootCanisterId));
  const topics = $derived($topicsStore ?? []);

  const criticalTopicInfos = $derived(
    topics.filter((topicInfo) => fromDefinedNullable(topicInfo.is_critical))
  );

  const nonCriticalTopicInfos = $derived(
    topics.filter((topicInfo) => !fromDefinedNullable(topicInfo.is_critical))
  );
</script>

<Modal testId="sns-topic-definitions-modal-component" {onClose}>
  {#snippet title()}{$i18n.follow_sns_topics.topic_definitions_title}
  {/snippet}

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
    {#each criticalTopicInfos as topicInfo (getSnsTopicInfoKey(topicInfo))}
      <SnsTopicDefinitionsTopic {topicInfo} />
    {/each}
  </div>

  <div class="topic-group" data-tid="non-critical-topic-group">
    <h5 class="headline description"
      >{$i18n.follow_sns_topics.topics_non_critical_label}
      <TooltipIcon
        >{$i18n.follow_sns_topics.topics_non_critical_tooltip}</TooltipIcon
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
      data-tid="close-button"
      onclick={onClose}
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

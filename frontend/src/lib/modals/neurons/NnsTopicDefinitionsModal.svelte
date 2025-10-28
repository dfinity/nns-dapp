<script lang="ts">
  import Separator from "$lib/components/ui/Separator.svelte";
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { getTopicSubtitle, getTopicTitle } from "$lib/utils/neuron.utils";
  import { sortNnsTopics } from "$lib/utils/proposals.utils";
  import { Modal, Collapsible } from "@dfinity/gix-components";
  import { Topic } from "@dfinity/nns";

  interface Props {
    onClose: () => void;
  }

  let { onClose }: Props = $props();

  const requiredTopics = [
    Topic.Governance,
    Topic.SnsAndCommunityFund,
    Topic.Unspecified,
  ];
  const allTopics = Object.values(Topic).filter(
    (topic): topic is Topic => typeof topic === "number"
  );
  const sortedTopics = sortNnsTopics({ topics: allTopics, i18n: $i18n });
  const otherTopics = sortedTopics.filter(
    (topic) => !requiredTopics.includes(topic)
  );

  const getTopicInfo = (topic: Topic) => ({
    title: getTopicTitle({ topic, i18n: $i18n }),
    description: getTopicSubtitle({ topic, i18n: $i18n }),
  });
</script>

<Modal testId="nns-topic-definitions-modal-component" {onClose}>
  {#snippet title()}{$i18n.follow_neurons.topic_definitions_title}{/snippet}

  <p class="description">{$i18n.follow_neurons.topic_definitions_description}</p
  >

  <Separator spacing="medium" />

  <div class="topic-group" data-tid="required-topic-group">
    <h5 class="headline description">
      {$i18n.follow_neurons.required_settings}
      <TooltipIcon
        >{$i18n.follow_neurons.required_settings_description}</TooltipIcon
      >
    </h5>
    {#each requiredTopics as topic}
      {@const topicInfo = getTopicInfo(topic)}
      <div>
        <Collapsible wrapHeight>
          {#snippet header()}
            <div class="header" data-tid="topic-name">
              {topicInfo.title}
            </div>
          {/snippet}
          <div class="expandable-content">
            {#if topicInfo.description}
              <p class="topic-description">
                {topicInfo.description}
              </p>
            {/if}
          </div>
        </Collapsible>
      </div>
    {/each}
  </div>

  <div class="topic-group" data-tid="other-topic-group">
    <h5 class="headline description">
      {$i18n.follow_neurons.advanced_settings}
    </h5>
    {#each otherTopics as topic}
      {@const topicInfo = getTopicInfo(topic)}
      <div>
        <Collapsible wrapHeight>
          {#snippet header()}
            <div class="header" data-tid="topic-name">
              {topicInfo.title}
            </div>
          {/snippet}
          <div class="expandable-content">
            {#if topicInfo.description}
              <p class="topic-description">
                {topicInfo.description}
              </p>
            {/if}
          </div>
        </Collapsible>
      </div>
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

  .header {
    padding: var(--padding) 0;
  }

  .topic-description {
    margin: 0 0 var(--padding-2x);
    color: var(--primary-contrast-tint);
    font-size: var(--font-size-small);
    line-height: var(--line-height-standard);
  }

  .description {
    margin-bottom: var(--padding);
  }
</style>

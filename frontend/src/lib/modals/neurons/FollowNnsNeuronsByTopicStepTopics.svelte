<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import FollowNnsNeuronsByTopicItem from "$lib/modals/neurons/FollowNnsNeuronsByTopicItem.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { topicsToFollow } from "$lib/utils/neuron.utils";
  import { getNnsTopicFollowings } from "$lib/utils/nns-topics.utils";
  import { sortNnsTopics } from "$lib/utils/proposals.utils";
  import {
    Topic,
    type FolloweesForTopic,
    type NeuronId,
    type NeuronInfo,
  } from "@dfinity/nns";

  type Props = {
    neuron: NeuronInfo;
    selectedTopics: Topic[];
    onClose: () => void;
    openNextStep: () => void;
    removeFollowing: (args: { topic: Topic; followee: NeuronId }) => void;
  };
  let {
    neuron,
    selectedTopics = $bindable(),
    onClose,
    openNextStep,
    removeFollowing,
  }: Props = $props();

  const followings: FolloweesForTopic[] = $derived(
    getNnsTopicFollowings(neuron)
  );

  const topics = $derived(
    neuron ? sortNnsTopics({ topics: topicsToFollow(neuron), i18n: $i18n }) : []
  );

  const requiredTopics = [
    Topic.Governance,
    Topic.SnsAndCommunityFund,
    Topic.Unspecified,
  ];
  const otherTopics: Topic[] = $derived(
    topics.filter((topic) => !requiredTopics.includes(topic))
  );

  const onTopicSelectionChange = ({
    topic,
    checked,
  }: {
    topic: Topic;
    checked: boolean;
  }) =>
    (selectedTopics = checked
      ? [...selectedTopics, topic]
      : selectedTopics.filter((t) => t !== topic));

  const isTopicSelected = (topic: Topic) => selectedTopics.includes(topic);
</script>

<TestIdWrapper testId="follow-nns-neurons-by-topic-step-topics-component">
  <p class="description">{$i18n.follow_neurons.description}</p>

  <Separator spacing="medium" />

  <div class="topic-group" data-tid="required-topic-group">
    <h5 class="headline description">
      {$i18n.follow_neurons.required_settings}
      <TooltipIcon
        >{$i18n.follow_neurons.required_settings_description}</TooltipIcon
      >
    </h5>
    {#each requiredTopics as topic}
      <FollowNnsNeuronsByTopicItem
        {topic}
        followees={followings}
        checked={isTopicSelected(topic)}
        onNnsChange={onTopicSelectionChange}
        {removeFollowing}
      />
    {/each}
  </div>

  <div class="topic-group" data-tid="other-topic-group">
    <h5 class="headline description"
      >{$i18n.follow_neurons.advanced_settings}</h5
    >
    {#each otherTopics as topic}
      <FollowNnsNeuronsByTopicItem
        {topic}
        followees={followings}
        checked={isTopicSelected(topic)}
        onNnsChange={onTopicSelectionChange}
        {removeFollowing}
      />
    {/each}
  </div>

  <div class="toolbar">
    <button
      class="secondary"
      type="button"
      data-tid="cancel-button"
      onclick={onClose}
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
  }

  .headline {
    margin: 0 0 var(--padding) 0;
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    margin-top: var(--padding-3x);
  }

  .description {
    margin-bottom: var(--padding);
  }
</style>

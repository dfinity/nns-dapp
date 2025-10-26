<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import FollowNnsNeuronsByTopicItem from "$lib/modals/neurons/FollowNnsNeuronsByTopicItem.svelte";
  import { listKnownNeurons } from "$lib/services/known-neurons.services";
  import { removeFollowing as removeFollowingService } from "$lib/services/neurons.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsShow } from "$lib/stores/toasts.store";
  import { mapNeuronErrorToToastMessage } from "$lib/utils/error.utils";
  import { topicsToFollow } from "$lib/utils/neuron.utils";
  import { getNnsTopicFollowings } from "$lib/utils/nns-topics.utils";
  import { sortNnsTopics } from "$lib/utils/proposals.utils";
  import { Collapsible, IconExpandMore } from "@dfinity/gix-components";
  import {
    Topic,
    type FolloweesForTopic,
    type NeuronId,
    type NeuronInfo,
  } from "@dfinity/nns";
  import { onMount } from "svelte";

  type Props = {
    neuron: NeuronInfo;
    selectedTopics: Topic[];
    onClose: () => void;
    openNextStep: () => void;
  };
  let {
    neuron,
    selectedTopics = $bindable(),
    onClose,
    openNextStep,
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
  let cmp = $state<Collapsible | undefined>(undefined);
  let toggleContent = () => cmp?.toggleContent();
  let expanded: boolean = $state(false);

  const removeFollowing = async ({
    topic,
    followee,
  }: {
    topic: Topic;
    followee: NeuronId;
  }) => {
    startBusy({ initiator: "remove-followee" });
    try {
      await removeFollowingService({
        neuronId: neuron.neuronId,
        topics: [topic],
        followee,
      });
    } catch (err: unknown) {
      const toastMessage = mapNeuronErrorToToastMessage(err);
      toastsShow(toastMessage);
    } finally {
      stopBusy("remove-followee");
    }
  };

  // Load KnownNeurons here to display their names in FollowNnsNeuronsByTopicItem
  // and on the next step.
  onMount(listKnownNeurons);
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
    <Collapsible
      expandButton={false}
      externalToggle={true}
      bind:this={cmp}
      bind:expanded
      wrapHeight
    >
      {#snippet header()}
        <div class="header" class:expanded>
          <h5 class="headline description"
            >{$i18n.follow_neurons.advanced_settings}</h5
          >
          <button
            data-tid="expand-button"
            class="expand-button"
            class:expanded
            onclick={toggleContent}
          >
            <IconExpandMore />
          </button>
        </div>
      {/snippet}

      {#each otherTopics as topic}
        <FollowNnsNeuronsByTopicItem
          {topic}
          followees={followings}
          checked={isTopicSelected(topic)}
          onNnsChange={onTopicSelectionChange}
          {removeFollowing}
        />
      {/each}
    </Collapsible>
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

  .header {
    display: flex;
    justify-content: space-between;
    gap: var(--padding);
    align-items: center;

    // stretching to the full Collapsible header width
    flex: 1 1 100%;
  }

  .expand-button {
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary);

    transition: transform ease-out var(--animation-time-normal);
    &.expanded {
      transform: rotate(-180deg);
    }
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

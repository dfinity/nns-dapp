<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { NnsTopicFollowee } from "$lib/types/nns";
  import { Collapsible } from "@dfinity/gix-components";
  import { Topic, type NeuronId, type NeuronInfo } from "@dfinity/nns";
  import FollowNnsNeuronsByTopicItem from "./FollowNnsNeuronsByTopicItem.svelte";

  type Props = {
    neuron?: NeuronInfo;
    topics: Topic[];
    selectedTopics: Topic[];
    closeModal: () => void;
    openNextStep: () => void;
    addFollowing: () => void;
    removeFollowing: (args: { topic: Topic; neuronId: NeuronId }) => void;
  };
  let {
    neuron,
    topics,
    selectedTopics = $bindable(),
    closeModal,
    openNextStep,
    addFollowing,
    removeFollowing,
  }: Props = $props();

  const [requiredTopics, advanceTopics] = $derived.by(() => {
    const allTopics = topics.findIndex((topic) => topic === Topic.Unspecified);
    return [topics.slice(0, allTopics + 1), topics.slice(allTopics + 1)];
  });

  // const openNewFolloweeModal = () => (showNewFolloweeModal = true);
  // const closeNewFolloweeModal = () => (showNewFolloweeModal = false);

  // const removeCurrentFollowee = async (followee: NeuronId) => {
  //   startBusy({ initiator: "remove-followee" });
  //   await removeFollowee({
  //     neuronId: neuron.neuronId,
  //     topic,
  //     followee,
  //   });
  //   stopBusy("remove-followee");
  // };
  const onTopicSelectionChange = ({
    topic,
    checked,
  }: {
    topic: Topic;
    checked: boolean;
  }) => {
    if (checked) {
      selectedTopics = [...selectedTopics, topic];
    } else {
      selectedTopics = selectedTopics.filter((key) => key !== topic);
    }
  };
  const followees: NnsTopicFollowee[] = [];
</script>

<TestIdWrapper testId="follow-sns-neurons-by-topic-step-topics-component">
  <p class="description">
    Delegate your voting by following other neurons to maximize your voting
    rewards. Your voting is fully delegated only if following is set for every
    topic. Alternatively, you can vote manually.
  </p>

  <Separator spacing="medium" />

  <div class="topic-group" data-tid="critical-topic-group">
    <h5 class="headline description"
      >Required Settings
      <TooltipIcon
        >{$i18n.follow_sns_topics.topics_critical_tooltip}</TooltipIcon
      ></h5
    >

    {#each requiredTopics as topic}
      <FollowNnsNeuronsByTopicItem
        {topic}
        {removeFollowing}
        {followees}
        onNnsChange={onTopicSelectionChange}
        checked={selectedTopics.includes(topic)}
      />
    {/each}
  </div>

  <Separator spacing="medium" />

  <div class="topic-group" data-tid="critical-topic-group">
    <!-- Requires a maxContentHeight overwrite to allow the content to grow to the maximum if all children are expanded -->
    <Collapsible
      testId="topic-collapsible"
      iconSize="medium"
      maxContentHeight={3000}
    >
      <h5 slot="header" class="headline description">Advance Settings </h5>

      {#each advanceTopics as topic}
        <FollowNnsNeuronsByTopicItem
          {topic}
          {removeFollowing}
          {followees}
          onNnsChange={onTopicSelectionChange}
          checked={selectedTopics.includes(topic)}
        />
      {/each}
    </Collapsible>
  </div>

  <!-- TODO: Alls modals should have a foote always visible and scrolling area should be for the content -->
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

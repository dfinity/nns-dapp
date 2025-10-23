<script lang="ts">
  import {
    Checkbox,
    Collapsible,
    IconCheckCircleFill,
    IconErrorOutline,
    IconExpandMore,
  } from "@dfinity/gix-components";
  import FollowNnsNeuronsByTopicFollowee from "$lib/modals/neurons/FollowNnsNeuronsByTopicFollowee.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { getTopicTitle, getTopicSubtitle } from "$lib/utils/neuron.utils";
  import { Topic, type FolloweesForTopic, type NeuronId } from "@dfinity/nns";

  type Props = {
    topic: Topic;
    followees: FolloweesForTopic[];
    checked: boolean;
    onNnsChange: (args: { topic: Topic; checked: boolean }) => void;
    removeFollowing: (args: { topic: Topic; followee: NeuronId }) => void;
  };

  let {
    topic,
    followees,
    checked = false,
    onNnsChange,
    removeFollowing,
  }: Props = $props();

  const title: string = $derived(getTopicTitle({ topic, i18n: $i18n }));
  const description: string = $derived(
    getTopicSubtitle({ topic, i18n: $i18n })
  );

  const onChange = () => {
    // Checkbox doesn't support two-way binding
    checked = !checked;
    onNnsChange({ topic, checked });
  };

  let cmp = $state<Collapsible | undefined>(undefined);

  let toggleContent = () => cmp?.toggleContent();
  let expanded: boolean = $state(false);

  // Get followees for this specific topic
  const topicFollowees: NeuronId[] = $derived(
    followees.find((f) => f.topic === topic)?.followees ?? []
  );
  const isFollowingByTopic = $derived(topicFollowees.length > 0);
</script>

<div class="topic-item" data-tid="follow-nns-neurons-by-topic-item-component">
  <Collapsible
    testId="topic-collapsible"
    expandButton={false}
    externalToggle={true}
    bind:this={cmp}
    bind:expanded
    wrapHeight
  >
    {#snippet header()}<div class="header" class:expanded>
        <Checkbox
          inputId={String(topic)}
          text="block"
          {checked}
          on:nnsChange={onChange}
          --checkbox-label-order="1"
          --checkbox-padding="var(--padding) 0"
        >
          <span data-tid="topic-name">{title}</span>
        </Checkbox>

        <div
          class="icon"
          data-tid="topic-following-status"
          class:isFollowingByTopic
        >
          {#if isFollowingByTopic}
            <IconCheckCircleFill />
          {:else}
            <IconErrorOutline />
          {/if}
        </div>

        <button
          data-tid="expand-button"
          class="expand-button"
          class:expanded
          onclick={toggleContent}
        >
          <IconExpandMore />
        </button>
      </div>{/snippet}
    <div class="expandable-content">
      <p class="description" data-tid="topic-description">
        {description}
      </p>

      <div class="followees">
        {#if topicFollowees.length > 0}
          <h5 class="followee-header"
            >{$i18n.follow_sns_topics.topics_following}</h5
          >
          <ul class="followee-list">
            {#each topicFollowees as neuronId (neuronId)}
              <li
                ><FollowNnsNeuronsByTopicFollowee
                  {neuronId}
                  onRemoveClick={() => {
                    removeFollowing({
                      topic,
                      followee: neuronId,
                    });
                  }}
                />
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </div></Collapsible
  >
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .header {
    display: grid;
    grid-template-columns: auto min-content min-content;
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

  .expandable-content {
    // Aligning with the checkbox label
    margin-left: calc(20px + var(--padding));
  }

  .followee-header {
    @include fonts.small(true);

    margin-top: var(--padding-2x);
    color: var(--description-color);
  }

  .followee-list {
    padding: 0;
    list-style-type: none;

    display: flex;
    flex-wrap: wrap;
    gap: var(--padding);
  }

  .icon {
    display: flex;
    align-items: center;
    color: var(--tertiary);

    &.isFollowingByTopic {
      color: var(--positive-emphasis);
    }
  }
</style>

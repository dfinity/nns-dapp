<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { NnsTopicFollowee } from "$lib/types/nns";
  import { getTopicSubtitle, getTopicTitle } from "$lib/utils/neuron.utils";
  import {
    Checkbox,
    Collapsible,
    IconCheckCircleFill,
    IconErrorOutline,
    IconExpandMore,
  } from "@dfinity/gix-components";
  import type { NeuronId, Topic } from "@dfinity/nns";

  type Props = {
    topic: Topic;
    followees: NnsTopicFollowee[];
    checked: boolean;
    onNnsChange: (args: { topic: Topic; checked: boolean }) => void;
    removeFollowing: (args: { topic: Topic; neuronId: NeuronId }) => void;
  };

  let {
    topic,
    followees,
    checked = false,
    onNnsChange,
    removeFollowing,
  }: Props = $props();

  const name = $derived(getTopicTitle({ topic, i18n: $i18n }));
  let description = $derived(getTopicSubtitle({ topic, i18n: $i18n }));

  // const topicKey: SnsTopicKey = $derived(getSnsTopicInfoKey(topicInfo));
  // const name: string = $derived(fromDefinedNullable(topicInfo.name));
  // const description: string = $derived(
  //   fromDefinedNullable(topicInfo.description)
  // );
  // const followees: FolloweeData[] = $derived.by(() => {
  //   const followesPerTopic = followeesByTopic({ neuron, topic });

  //   const mapToKnownNeuron = (neuronId: NeuronId): FolloweeData => {
  //     const knownNeuron = $knownNeuronsStore.find(({ id }) => id === neuronId);
  //     return nonNullish(knownNeuron)
  //       ? {
  //           neuronId: knownNeuron.id,
  //           name: knownNeuron.name,
  //         }
  //       : { neuronId };
  //   };
  //   // If we remove the last followee of that topic, followesPerTopic is undefined.
  //   // and we need to reset the followees array
  //   return followesPerTopic?.map(mapToKnownNeuron) ?? [];
  // });

  const onChange = () => {
    // Checkbox doesn't support two-way binding
    checked = !checked;
    onNnsChange({ topic, checked });
  };

  let toggleContent: () => void = $state(() => {});
  let expanded: boolean = $state(false);
  const isFollowingByTopic = $derived(followees.length > 0);
</script>

<div class="topic-item" data-tid="follow-sns-neurons-by-topic-item-component">
  <Collapsible
    testId="topic-collapsible"
    expandButton={false}
    externalToggle={true}
    bind:toggleContent
    bind:expanded
  >
    <div slot="header" class="header" class:expanded>
      <Checkbox
        inputId={String(topic)}
        text="block"
        {checked}
        on:nnsChange={onChange}
        --checkbox-label-order="1"
        --checkbox-padding="var(--padding) 0"
      >
        <span data-tid="topic-name">{name}</span>
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
    </div>
    <div class="expandable-content">
      <p class="description" data-tid="topic-description">
        {description}
      </p>

      <div class="followees">
        {#if followees.length > 0}
          <h5 class="followee-header"
            >{$i18n.follow_sns_topics.topics_following}</h5
          >
        {/if}

        {#if followees.length > 0}
          <ul class="followee-list">
            {#each followees as followee}
              <li>{followee} </li>
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

  .legacy-description {
    @include fonts.small();
    margin: var(--padding) 0;
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

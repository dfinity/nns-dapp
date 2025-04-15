<script lang="ts">
  import {
    Checkbox,
    Collapsible,
    IconCheckCircleFill,
    IconErrorOutline,
    IconExpandMore,
  } from "@dfinity/gix-components";
  import type { TopicInfoWithUnknown } from "$lib/types/sns-aggregator";
  import { fromDefinedNullable } from "@dfinity/utils";
  import type {
    SnsLegacyFollowings,
    SnsTopicFollowee,
    SnsTopicKey,
  } from "$lib/types/sns";
  import { getSnsTopicInfoKey } from "$lib/utils/sns-topics.utils";
  import type { SnsNervousSystemFunction, SnsNeuronId } from "@dfinity/sns";
  import FollowSnsNeuronsByTopicFollowee from "$lib/modals/sns/neurons/FollowSnsNeuronsByTopicFollowee.svelte";
  import { subaccountToHexString } from "$lib/utils/sns-neuron.utils";
  import FollowSnsNeuronsByTopicLegacyFollowee from "$lib/modals/sns/neurons/FollowSnsNeuronsByTopicLegacyFollowee.svelte";
  import { i18n } from "$lib/stores/i18n";

  type Props = {
    topicInfo: TopicInfoWithUnknown;
    followees: SnsTopicFollowee[];
    legacyFollowees: SnsLegacyFollowings[];
    checked: boolean;
    onNnsChange: (args: { topicKey: SnsTopicKey; checked: boolean }) => void;
    removeFollowing: (args: {
      topicKey: SnsTopicKey;
      neuronId: SnsNeuronId;
    }) => void;
    removeLegacyFollowing: (args: {
      nsFunction: SnsNervousSystemFunction;
      followee: SnsNeuronId;
    }) => void;
  };

  let {
    topicInfo,
    followees,
    legacyFollowees,
    checked = false,
    onNnsChange,
    removeFollowing,
    removeLegacyFollowing,
  }: Props = $props();

  let topicKey: SnsTopicKey = $derived(getSnsTopicInfoKey(topicInfo));
  let name: string = $derived(fromDefinedNullable(topicInfo.name));
  let description: string = $derived(
    fromDefinedNullable(topicInfo.description)
  );

  const onChange = () => {
    // Checkbox doesn't support two-way binding
    checked = !checked;
    onNnsChange({ topicKey, checked });
  };

  let toggleContent: () => void = $state(() => {});
  let expanded: boolean = $state(false);
  const isTopicFollowing = $derived(followees.length > 0);

  // TODO(sns-topics): Add "stopPropagation" prop to the gix/Checkbox component
  // to avoid collapsable toggling
</script>

<div class="topic-item" data-tid="follow-sns-neurons-by-topic-item-component">
  <Collapsible
    testId="topic-collapsible"
    expandButton={false}
    externalToggle={true}
    bind:toggleContent
    bind:expanded
    wrapHeight
  >
    <div slot="header" class="header" class:expanded>
      <Checkbox
        inputId={topicKey}
        text="block"
        {checked}
        on:nnsChange={onChange}
        preventDefault
        --checkbox-label-order="1"
        --checkbox-padding="var(--padding) 0"
      >
        <span data-tid="topic-name">{name}</span>
      </Checkbox>

      <div
        class="icon"
        data-tid="topic-following-status"
        class:isTopicFollowing
      >
        {#if isTopicFollowing}
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
          <ul class="followee-list">
            {#each followees as followee (subaccountToHexString(followee.neuronId.id))}
              <li
                ><FollowSnsNeuronsByTopicFollowee
                  neuronId={followee.neuronId}
                  onRemoveClick={() => {
                    removeFollowing({
                      topicKey,
                      neuronId: followee.neuronId,
                    });
                  }}
                />
              </li>
            {/each}
          </ul>
        {/if}

        {#if legacyFollowees.length > 0}
          <h5 class="followee-header"
            >{$i18n.follow_sns_topics.topics_following}</h5
          >
          <p class="description legacy-description"
            >{$i18n.follow_sns_topics.topics_legacy_following_description}</p
          >
          <ul class="followee-list">
            {#each legacyFollowees as followees (followees.nsFunction.id)}
              {#each followees.followees as neuronId (subaccountToHexString(neuronId.id))}
                <li>
                  <FollowSnsNeuronsByTopicLegacyFollowee
                    nsFunction={followees.nsFunction}
                    {neuronId}
                    onRemoveClick={() => {
                      removeLegacyFollowing({
                        nsFunction: followees.nsFunction,
                        followee: neuronId,
                      });
                    }}
                  />
                </li>
              {/each}
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
    margin-top: var(--padding-3x);
    color: var(--description-color);
  }

  .legacy-description {
    @include fonts.small();
    margin-bottom: var(--padding);
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

    &.isTopicFollowing {
      color: var(--positive-emphasis);
    }
  }

  .followee-list {
    padding: 0;
    list-style-type: none;

    display: flex;
    flex-wrap: wrap;
    gap: var(--padding-0_5x);
  }
</style>

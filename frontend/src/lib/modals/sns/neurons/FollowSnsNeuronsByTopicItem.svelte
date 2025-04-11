<script lang="ts">
  import {
    Checkbox,
    Collapsible,
    IconErrorOutline,
    IconExpandMore,
  } from "@dfinity/gix-components";
  import type { TopicInfoWithUnknown } from "$lib/types/sns-aggregator";
  import { fromDefinedNullable } from "@dfinity/utils";
  import type { SnsTopicFollowee, SnsTopicKey } from "$lib/types/sns";
  import { getSnsTopicInfoKey } from "$lib/utils/sns-topics.utils";
  import type { SnsNeuronId } from "@dfinity/sns";
  import FollowSnsNeuronsByTopicFollowee from "$lib/modals/sns/neurons/FollowSnsNeuronsByTopicFollowee.svelte";
  import { subaccountToHexString } from "$lib/utils/sns-neuron.utils";

  type Props = {
    topicInfo: TopicInfoWithUnknown;
    followees: SnsTopicFollowee[];
    checked: boolean;
    onNnsChange: (args: { topicKey: SnsTopicKey; checked: boolean }) => void;
    onNnsRemove: (args: {
      topicKey: SnsTopicKey;
      neuronId: SnsNeuronId;
    }) => void;
  };

  const { topicInfo, followees, onNnsChange, onNnsRemove }: Props = $props();
  let { checked = false }: Props = $props();

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

      <!-- TODO: display following status -->
      <div class="icon" data-tid="topic-following-status">
        <IconErrorOutline />
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
          <h5 class="headline description"> Followees</h5>
          <ul class="followee-list">
            {#each followees as followee (subaccountToHexString(followee.neuronId.id))}
              <li
                ><FollowSnsNeuronsByTopicFollowee
                  {followee}
                  onRemoveClick={() => {
                    onNnsRemove({
                      topicKey,
                      neuronId: followee.neuronId,
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

    .description {
      margin: 0 0 var(--padding-3x);
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

<script lang="ts">
  import {
    Checkbox,
    Collapsible,
    IconErrorOutline,
    IconExpandMore,
  } from "@dfinity/gix-components";
  import type { TopicInfoWithUnknown } from "$lib/types/sns-aggregator";
  import { fromDefinedNullable } from "@dfinity/utils";
  import type { SnsTopicKey } from "$lib/types/sns";
  import { getSnsTopicInfoKey } from "$lib/utils/sns-topics.utils";

  export let topicInfo: TopicInfoWithUnknown;
  export let checked: boolean = false;
  export let onNnsChange: (args: {
    topicKey: SnsTopicKey;
    checked: boolean;
  }) => void;

  let topicKey: SnsTopicKey;
  $: topicKey = getSnsTopicInfoKey(topicInfo);
  let name: string;
  $: name = fromDefinedNullable(topicInfo.name);
  let description: string;
  $: description = fromDefinedNullable(topicInfo.description);

  const onChange = () => {
    // Checkbox doesn't support two-way binding
    checked = !checked;
    onNnsChange({ topicKey, checked });
  };

  let toggleContent: () => void;
  let expanded: boolean;

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
        on:click|stopPropagation={toggleContent}
      >
        <IconExpandMore />
      </button>
    </div>
    <div class="expandable-content">
      <p class="description" data-tid="topic-description">
        {description}
      </p>
    </div>
  </Collapsible>
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
</style>

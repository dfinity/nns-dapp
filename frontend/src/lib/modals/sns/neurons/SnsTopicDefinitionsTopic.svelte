<script lang="ts">
  import { Collapsible, Tag, Tooltip } from "@dfinity/gix-components";
  import type { TopicInfoWithUnknown } from "$lib/types/sns-aggregator";
  import { fromDefinedNullable, fromNullable } from "@dfinity/utils";
  import { getAllSnsNSFunctions } from "$lib/utils/sns-topics.utils";
  import type { SnsNervousSystemFunction } from "@dfinity/sns";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";

  export let topicInfo: TopicInfoWithUnknown;

  let name: string;
  $: name = fromDefinedNullable(topicInfo.name);
  let description: string;
  $: description = fromDefinedNullable(topicInfo.description);

  let nsFunctions: SnsNervousSystemFunction[];
  $: nsFunctions = getAllSnsNSFunctions(topicInfo);
</script>

<div class="topic-item" data-tid="sns-topic-definitions-topic-component">
  <Collapsible testId="topic-collapsible" wrapHeight>
    {#snippet header()}<div class="header" data-tid="topic-name"
        >{name}
      </div>{/snippet}
    <div class="expandable-content">
      <div>
        <p class="description" data-tid="topic-description">
          {description}
        </p>

        <div class="functions">
          {#each nsFunctions as nsFunction (nsFunction.id.toString())}
            <TestIdWrapper testId="ns-function">
              <Tooltip text={fromNullable(nsFunction.description)}>
                <Tag testId="ns-function-name">{nsFunction.name}</Tag>
              </Tooltip>
            </TestIdWrapper>
          {/each}
        </div>
      </div>
    </div>
  </Collapsible>
</div>

<style lang="scss">
  .header {
    padding: var(--padding) 0;
  }

  .description {
    margin: 0 0 var(--padding-2x);
  }

  .functions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--padding-0_5x);
    margin-bottom: var(--padding-2x);
  }
</style>

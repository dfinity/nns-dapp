<script lang="ts">
  import { Collapsible, Tag, Tooltip } from "@dfinity/gix-components";
  import type { TopicInfoWithUnknown } from "$lib/types/sns-aggregator";
  import { fromDefinedNullable, fromNullable } from "@dfinity/utils";
  import type { SnsTopicKey } from "$lib/types/sns";
  import {
    getAllSnsNSFunctions,
    getSnsTopicInfoKey,
  } from "$lib/utils/sns-topics.utils";
  import type { NervousSystemFunction } from "@dfinity/sns/dist/candid/sns_governance";

  export let topicInfo: TopicInfoWithUnknown;

  let topicKey: SnsTopicKey;
  $: topicKey = getSnsTopicInfoKey(topicInfo);
  let name: string;
  $: name = fromDefinedNullable(topicInfo.name);
  let description: string;
  $: description = fromDefinedNullable(topicInfo.description);

  let nsFunctions: NervousSystemFunction[];
  $: nsFunctions = getAllSnsNSFunctions(topicInfo);
</script>

<div class="topic-item" data-tid="sns-topic-definitions-topic-component">
  <Collapsible testId="topic-collapsible" wrapHeight>
    <div slot="header" class="header" data-tid="topic-name">{name} </div>
    <div class="expandable-content">
      <p class="description" data-tid="topic-description">
        {description}
      </p>

      <div class="functions">
        {#each nsFunctions as nsFunction (nsFunction.id.toString())}
          <Tooltip testId="tooltip" text={fromNullable(nsFunction.description)}>
            <Tag testId="ns-function-name">{nsFunction.name}</Tag>
          </Tooltip>
        {/each}
      </div>
    </div>
  </Collapsible>
</div>

<style lang="scss">
  .functions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--padding);
  }
</style>

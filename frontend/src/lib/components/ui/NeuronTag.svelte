<script lang="ts">
  import Tooltip from "$lib/components/ui/Tooltip.svelte";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { Tag } from "@dfinity/gix-components";
  import type { NeuronTagData } from "$lib/utils/neuron.utils";
  import { nonNullish } from "@dfinity/utils";

  export let tag: NeuronTagData;

  let text: string;
  $: text = tag.text;

  let description: string | undefined;
  $: description = tag.description;
</script>

<TestIdWrapper testId="neuron-tag">
  <div>
    {#if nonNullish(tag.description)}
      <Tooltip id="neuron-type-tag-tooltip" text={description}>
        <Tag>{text}</Tag>
      </Tooltip>
    {:else}
      <Tag>{text}</Tag>
    {/if}
  </div>
</TestIdWrapper>

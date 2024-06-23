<script lang="ts">
  import Hash from "$lib/components/ui/Hash.svelte";
  import type { TableNeuron } from "$lib/types/neurons-table";
  import { Tag } from "@dfinity/gix-components";

  export let rowData: TableNeuron;
</script>

<div data-tid="neuron-id-cell-component" class="container">
  <Hash
    testId="neuron-id"
    text={rowData.neuronId}
    tagName="span"
    idPrefix="neuron-id-cell"
    showCopy
  />
  {#if rowData.tags.length > 0}
    <span class="tags" data-tid="neuron-tags">
      {#each rowData.tags as tag}
        <Tag testId="neuron-tag">{tag}</Tag>
      {/each}
    </span>
  {/if}
</div>

<style lang="scss">
  .container {
    line-height: 1.5;
  }

  .tags {
    display: inline-flex;
    gap: var(--padding);
  }
</style>

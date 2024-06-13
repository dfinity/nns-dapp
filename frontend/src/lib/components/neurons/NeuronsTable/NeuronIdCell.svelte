<script lang="ts">
  import type { TableNeuron } from "$lib/types/neurons-table";
  import Hash from "$lib/components/ui/Hash.svelte";
  import { Tag } from "@dfinity/gix-components";

  export let rowData: TableNeuron;
</script>

<div data-tid="neuron-id-cell-component">
  <Hash idPrefix="neuron-id" tagName="span" text={rowData.neuronId} showCopy />
  <span class="tags">
    {#each rowData.tags as tag}
      <Tag testId="neuron-tag">{tag}</Tag>
    {/each}
  </span>
</div>

<style lang="scss">
  .tags {
    display: inline-flex;
    gap: var(--padding);
  }
</style>

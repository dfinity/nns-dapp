<script lang="ts">
  import type { TableNeuron } from "$lib/types/neurons-table";
  import IdentifierHash from "$lib/components/ui/IdentifierHash.svelte";
  import { Tag } from "@dfinity/gix-components";

  export let rowData: TableNeuron;
</script>

<div data-tid="neuron-id-cell-component">
  <IdentifierHash identifier={rowData.neuronId} />
  <div class="tags">
    {#each rowData.tags as tag}
      <Tag testId="neuron-tag">{tag}</Tag>
    {/each}
  </div>
</div>

<style lang="scss">
  .tags {
    display: flex;
    gap: var(--padding);
  }
</style>

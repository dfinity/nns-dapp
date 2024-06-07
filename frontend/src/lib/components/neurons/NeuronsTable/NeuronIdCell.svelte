<script lang="ts" context="module">
  let nextElementIdNumber = 0;
</script>

<script lang="ts">
  import type { TableNeuron } from "$lib/types/neurons-table";
  import Hash from "$lib/components/ui/Hash.svelte";
  import { Copy, Tag } from "@dfinity/gix-components";

  export let rowData: TableNeuron;

  let elementId = `neuron-id-cell-${nextElementIdNumber}`;
  ++nextElementIdNumber;
</script>

<div data-tid="neuron-id-cell-component" class="container">
  <span class="hash"
    ><Hash text={rowData.neuronId} tagName="span" id={elementId} /></span
  >
  <Copy value={rowData.neuronId} />
  <div class="tags">
    {#each rowData.tags as tag}
      <Tag testId="neuron-tag">{tag}</Tag>
    {/each}
  </div>
</div>

<style lang="scss">
  .container {
    display: grid;
    grid-row: span 2;
    grid-column: span 2;
    grid-template-rows: subgrid;
    grid-template-columns: subgrid;
    gap: 0;
  }

  .hash {
    align-self: center;
  }

  .tags {
    display: flex;
    gap: var(--padding);
    grid-column: 1/-1;
  }
</style>

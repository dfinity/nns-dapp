<script lang="ts">
  import type { TableProject } from "$lib/types/staking";
  import { nonNullish } from "@dfinity/utils";

  export let rowData: TableProject;
</script>

<div data-tid="project-neurons-cell-component">
  {#if nonNullish(rowData.neuronCount)}
    {rowData.neuronCount}
  {:else}
    -/-
  {/if}
</div>

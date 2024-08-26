<script lang="ts">
  import MaturityWithTooltip from "$lib/components/neurons/MaturityWithTooltip.svelte";
  import type { TableProject } from "$lib/types/staking";
  import { isNullish } from "@dfinity/utils";

  export let rowData: TableProject;
</script>

<div data-tid="project-maturity-cell-component">
  {#if isNullish(rowData.neuronCount) || isNullish(rowData.availableMaturity) || isNullish(rowData.stakedMaturity)}
    -/-
  {:else if rowData.neuronCount > 0}
    <MaturityWithTooltip
      availableMaturity={rowData.availableMaturity}
      stakedMaturity={rowData.stakedMaturity}
    />
  {/if}
</div>

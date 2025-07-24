<script lang="ts">
  import ApyDisplay from "$lib/components/ic/ApyDisplay.svelte";
  import type { TableProject } from "$lib/types/staking";
  import { nonNullish } from "@dfinity/utils";

  export let rowData: TableProject;
</script>

<div data-tid="project-apy-cell-component">
  {#if nonNullish(rowData.apy)}
    <ApyDisplay apy={rowData.apy} isLoading={false} />
  {/if}
</div>

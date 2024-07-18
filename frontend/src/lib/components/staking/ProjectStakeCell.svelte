<script lang="ts">
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import type { TableProject } from "$lib/types/staking";
  import { nonNullish } from "@dfinity/utils";

  export let rowData: TableProject;
</script>

<div data-tid="project-stake-cell-component">
  {#if nonNullish(rowData.stake)}
    {#if rowData.stake.toUlps() > 0}
      <AmountDisplay singleLine amount={rowData.stake} />
    {/if}
  {:else}
    <span>-/-</span>
  {/if}
</div>

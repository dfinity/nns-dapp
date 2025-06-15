<script lang="ts">
  import AmountWithUsd from "$lib/components/ic/AmountWithUsd.svelte";
  import type { TableProject } from "$lib/types/staking";
  import { TokenAmountV2 } from "@dfinity/utils";

  export let rowData: TableProject;
</script>

<div data-tid="project-stake-cell-component">
  {#if !(rowData.stake instanceof TokenAmountV2) || rowData.stake.toUlps() > 0}
    <AmountWithUsd amount={rowData.stake} amountInUsd={rowData.stakeInUsd} />
  {/if}
</div>

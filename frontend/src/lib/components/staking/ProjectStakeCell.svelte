<script lang="ts">
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import type { TableProject } from "$lib/types/staking";
  import { TokenAmountV2 } from "@dfinity/utils";

  export let rowData: TableProject;
</script>

<div data-tid="project-stake-cell-component">
  {#if !(rowData.stake instanceof TokenAmountV2) || rowData.stake.toUlps() > 0}
    <AmountDisplay singleLine amount={rowData.stake} />
  {/if}
</div>

<script lang="ts">
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import AmountWithUsd from "$lib/components/ic/AmountWithUsd.svelte";
  import { ENABLE_USD_VALUES_FOR_NEURONS } from "$lib/stores/feature-flags.store";
  import type { TableProject } from "$lib/types/staking";
  import { TokenAmountV2 } from "@dfinity/utils";

  export let rowData: TableProject;
</script>

<div data-tid="project-stake-cell-component">
  {#if !(rowData.stake instanceof TokenAmountV2) || rowData.stake.toUlps() > 0}
    {#if $ENABLE_USD_VALUES_FOR_NEURONS}
      <AmountWithUsd amount={rowData.stake} amountInUsd={rowData.stakeInUsd} />
    {:else}
      <AmountDisplay singleLine amount={rowData.stake} />
    {/if}
  {/if}
</div>

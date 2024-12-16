<script lang="ts">
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import AmountWithUsd from "$lib/components/ic/AmountWithUsd.svelte";
  import { ENABLE_USD_VALUES_FOR_NEURONS } from "$lib/stores/feature-flags.store";
  import type { TableNeuron } from "$lib/types/neurons-table";

  export let rowData: TableNeuron;
</script>

<div data-tid="neuron-stake-cell-component" class="container">
  {#if $ENABLE_USD_VALUES_FOR_NEURONS}
    <AmountWithUsd amount={rowData.stake} amountInUsd={rowData.stakeInUsd}
    ></AmountWithUsd>
  {:else}
    <AmountDisplay singleLine amount={rowData.stake} />
  {/if}
</div>

<style lang="scss">
  .container {
    display: contents;
    --amount-color: var(--table-row-text-color);
    --label-color: var(--table-row-text-color);
  }
</style>

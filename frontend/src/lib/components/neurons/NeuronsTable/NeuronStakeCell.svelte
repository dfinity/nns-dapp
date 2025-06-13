<script lang="ts">
  import AmountWithUsd from "$lib/components/ic/AmountWithUsd.svelte";
  import type { TableNeuron } from "$lib/types/neurons-table";

  type Props = {
    rowData: TableNeuron;
  };
  const { rowData }: Props = $props();
</script>

<div data-tid="neuron-stake-cell-component" class="container">
  <AmountWithUsd amount={rowData.stake} amountInUsd={rowData.stakeInUsd} />
</div>

<style lang="scss">
  .container {
    display: contents;
    --amount-color: var(--table-row-text-color);
    --label-color: var(--table-row-text-color);
  }
</style>

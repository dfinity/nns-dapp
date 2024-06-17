<script lang="ts">
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import type { TableNeuron } from "$lib/types/neurons-table";

  export let rowData: TableNeuron;
</script>

<div data-tid="neuron-stake-cell-component" class="container">
  <AmountDisplay singleLine amount={rowData.stake} />
</div>

<style lang="scss">
  .container {
    display: contents;
    --amount-color: var(--table-row-text-color);
    --label-color: var(--table-row-text-color);
  }
</style>

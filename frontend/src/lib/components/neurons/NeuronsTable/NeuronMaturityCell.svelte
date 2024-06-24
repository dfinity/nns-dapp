<script lang="ts">
  import type { TableNeuron } from "$lib/types/neurons-table";
  import { formatMaturity } from "$lib/utils/neuron.utils";

  export let rowData: TableNeuron;
  let totalMaturity = rowData.availableMaturity + rowData.stakedMaturity;
</script>

<div data-tid="neuron-maturity-cell-component" class="container">
  <span data-tid="total-maturity">
    {formatMaturity(totalMaturity)}
  </span>
</div>

<style lang="scss">
  .container {
    display: flex;
    align-items: center;
    gap: var(--padding-0_5x);
  }
</style>

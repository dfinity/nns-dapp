<script lang="ts">
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import type { TableNeuron } from "$lib/types/neurons-table";

  export let rowData: TableNeuron;
</script>

<div data-tid="neuron-stake-cell-component">
  <AmountDisplay singleLine amount={rowData.stake} />
</div>

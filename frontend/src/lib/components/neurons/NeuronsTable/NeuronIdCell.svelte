<script lang="ts">
  import type { TableNeuron } from "$lib/types/neurons-table";

  export let rowData: TableNeuron;
</script>

<div data-tid="neuron-id-cell-component">
  {rowData.neuronId}
</div>

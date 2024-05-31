<script lang="ts">
  import type { TableNeuron } from "$lib/types/neurons-table";
  import IdentifierHash from "$lib/components/ui/IdentifierHash.svelte";

  export let rowData: TableNeuron;
</script>

<div data-tid="neuron-id-cell-component">
  <IdentifierHash identifier={rowData.neuronId} />
</div>

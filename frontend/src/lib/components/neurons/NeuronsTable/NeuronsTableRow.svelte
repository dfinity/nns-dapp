<script lang="ts">
  import type { TableNeuron } from "$lib/types/neurons-table";

  export let neuron: TableNeuron;
</script>

<div data-tid="neurons-table-row-component">
  <div data-tid="neuron-id">{neuron.neuronId}</div>
</div>

<script lang="ts">
  import type { TableNeuron } from "$lib/types/neurons-table";
  import NeuronsTableRow from "$lib/components/neurons/NeuronsTable/NeuronsTableRow.svelte";

  export let neurons: TableNeuron[];
</script>

<div data-tid="neurons-table-component">
  <h1>The neurons table is under construction.</h1>
  {#each neurons as neuron}
    <NeuronsTableRow {neuron} />
  {/each}
</div>

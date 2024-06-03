<script lang="ts">
  import NeuronStateInfo from "$lib/components/neurons/NeuronStateInfo.svelte";
  import type { TableNeuron } from "$lib/types/neurons-table";

  export let rowData: TableNeuron;
</script>

<NeuronStateInfo state={rowData.state} />

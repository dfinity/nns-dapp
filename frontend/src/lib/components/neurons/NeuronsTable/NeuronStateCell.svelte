<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Tooltip } from "@dfinity/gix-components";
  import NeuronStateInfo from "$lib/components/neurons/NeuronStateInfo.svelte";
  import type { TableNeuron } from "$lib/types/neurons-table";
  import { NeuronState } from "@dfinity/nns";

  export let rowData: TableNeuron;
</script>

<Tooltip
  testId="neuron-state-cell-component"
  id="spawning-neuron-{rowData.neuronId}"
  text={rowData.state === NeuronState.Spawning
    ? $i18n.neuron_detail.spawning_neuron_info
    : undefined}
>
  <NeuronStateInfo state={rowData.state} />
</Tooltip>

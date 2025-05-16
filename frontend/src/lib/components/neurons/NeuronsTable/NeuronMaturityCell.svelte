<script lang="ts">
  import MaturityWithTooltip from "$lib/components/neurons/MaturityWithTooltip.svelte";
  import type { TableNeuron } from "$lib/types/neurons-table";

  type Props = {
    rowData: TableNeuron;
  };
  const { rowData }: Props = $props();
</script>

<div data-tid="neuron-maturity-cell-component">
  <MaturityWithTooltip
    availableMaturity={rowData.availableMaturity}
    stakedMaturity={rowData.stakedMaturity}
  />
</div>

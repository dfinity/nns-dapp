<script lang="ts">
  import type { TableNeuron } from "$lib/types/neurons-table";
  import ApyDisplay from "$lib/components/ic/ApyDisplay.svelte";

  type Props = {
    rowData: TableNeuron;
  };
  const { rowData }: Props = $props();
</script>

<div data-tid="neuron-apy-cell-component">
  <ApyDisplay apy={rowData.apy} isLoading={false} forPortfolio={false} />
</div>

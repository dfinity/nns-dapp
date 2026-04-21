<script lang="ts">
  import { formatDissolveDelay } from "$lib/utils/date.utils";
  import type { TableNeuron } from "$lib/types/neurons-table";

  type Props = {
    rowData: TableNeuron;
  };
  const { rowData }: Props = $props();

  const dissolveDelayDuration = $derived(
    formatDissolveDelay(rowData.dissolveDelaySeconds)
  );
</script>

<div data-tid="neuron-dissolve-delay-cell-component">
  {dissolveDelayDuration}
</div>

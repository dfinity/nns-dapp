<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { TableNeuron } from "$lib/types/neurons-table";
  import { secondsToDuration } from "@dfinity/utils";

  type Props = {
    rowData: TableNeuron;
  };
  const { rowData }: Props = $props();

  const dissolveDelayDuration = $derived(
    secondsToDuration({
      seconds: rowData.dissolveDelaySeconds,
      i18n: $i18n.time,
    })
  );
</script>

<div data-tid="neuron-dissolve-delay-cell-component">
  {dissolveDelayDuration}
</div>

<script lang="ts">
  import type { TableNeuron } from "$lib/types/neurons-table";
  import { secondsToDuration } from "@dfinity/utils";
  import { i18n } from "$lib/stores/i18n";

  export let rowData: TableNeuron;

  let dissolveDelayDuration: string;
  $: dissolveDelayDuration = secondsToDuration({
    seconds: rowData.dissolveDelaySeconds,
    i18n: $i18n.time,
  });
</script>

<div data-tid="neuron-dissolve-delay-cell-component">
  {dissolveDelayDuration}
</div>

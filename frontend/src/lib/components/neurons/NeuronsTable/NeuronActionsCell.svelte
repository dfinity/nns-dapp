<script lang="ts">
  import { IconRight } from "@dfinity/gix-components";
  import type { TableNeuron } from "$lib/types/neurons-table";

  export let rowData: TableNeuron;
</script>

{#if false}
  We need to reference {rowData} to satisfy the linter. We'll reference it properly
  in a future change.
{/if}
<IconRight />

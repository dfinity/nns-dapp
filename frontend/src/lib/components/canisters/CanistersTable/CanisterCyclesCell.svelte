<script lang="ts">
  import CanisterCardCycles from "$lib/components/canisters/CanisterCardCycles.svelte";
  import type { CanistersTableRowData } from "$lib/types/canisters-table";

  export let rowData: CanistersTableRowData;
</script>

<CanisterCardCycles canister={rowData.canister} />

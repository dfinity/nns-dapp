<script lang="ts">
  import ResponsiveTableSortControl from "$lib/components/ui/ResponsiveTableSortControl.svelte";
  import type {
    ResponsiveTableColumn,
    ResponsiveTableOrder,
  } from "$lib/types/responsive-table";
  import type { Writable } from "svelte/store";

  type TestRowData = {
    domKey: string;
    rowHref?: string;
    name: string;
    age: number;
  };

  export let columns: ResponsiveTableColumn<TestRowData>[];
  export let orderStore: Writable<ResponsiveTableOrder>;
</script>

<ResponsiveTableSortControl {columns} bind:order={$orderStore} />

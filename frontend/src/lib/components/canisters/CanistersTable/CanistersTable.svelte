<script lang="ts">
  import CanisterCyclesCell from "$lib/components/canisters/CanistersTable/CanisterCyclesCell.svelte";
  import CanisterTitleCell from "$lib/components/canisters/CanistersTable/CanisterTitleCell.svelte";
  import ResponsiveTable from "$lib/components/ui/ResponsiveTable.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type {
    CanistersTableColumn,
    CanistersTableRowData,
  } from "$lib/types/canisters-table";

  export let rowData: Array<CanistersTableRowData>;
  export let testId = "canisters-table-component";

  let columns: CanistersTableColumn[];
  $: columns = [
    {
      id: "name",
      title: $i18n.canisters.name,
      cellComponent: CanisterTitleCell,
      alignment: "left",
      templateColumns: ["1fr"],
    },
    {
      title: "",
      cellComponent: CanisterCyclesCell,
      alignment: "right",
      templateColumns: ["max-content"],
    },
  ];
</script>

<ResponsiveTable {testId} tableData={rowData} {columns} />

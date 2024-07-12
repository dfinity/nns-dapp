<script lang="ts">
  import ProjectActionsCell from "$lib/components/staking/ProjectActionsCell.svelte";
  import ProjectTitleCell from "$lib/components/staking/ProjectTitleCell.svelte";
  import ResponsiveTable from "$lib/components/ui/ResponsiveTable.svelte";
  import { selectableUniversesStore } from "$lib/derived/selectable-universes.derived";
  import { i18n } from "$lib/stores/i18n";
  import { definedNeuronsStore } from "$lib/stores/neurons.store";
  import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
  import type { ProjectsTableColumn, TableProject } from "$lib/types/staking";
  import { getTableProjects } from "$lib/utils/staking.utils";

  const columns: ProjectsTableColumn[] = [
    {
      title: $i18n.staking.nervous_systems,
      cellComponent: ProjectTitleCell,
      alignment: "left",
      templateColumns: ["1fr"],
    },
    {
      title: "",
      cellComponent: ProjectActionsCell,
      alignment: "right",
      templateColumns: ["max-content"],
    },
  ];

  let tableProjects: TableProject[];
  $: tableProjects = getTableProjects({
    universes: $selectableUniversesStore,
    nnsNeurons: $definedNeuronsStore,
    snsNeurons: $snsNeuronsStore,
  });
</script>

<ResponsiveTable
  testId="projects-table-component"
  tableData={tableProjects}
  {columns}
></ResponsiveTable>

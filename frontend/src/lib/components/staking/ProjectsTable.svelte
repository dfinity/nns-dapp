<script lang="ts">
  import ProjectActionsCell from "$lib/components/staking/ProjectActionsCell.svelte";
  import ProjectNeuronsCell from "$lib/components/staking/ProjectNeuronsCell.svelte";
  import ProjectTitleCell from "$lib/components/staking/ProjectTitleCell.svelte";
  import ResponsiveTable from "$lib/components/ui/ResponsiveTable.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { selectableUniversesStore } from "$lib/derived/selectable-universes.derived";
  import { i18n } from "$lib/stores/i18n";
  import { neuronsStore } from "$lib/stores/neurons.store";
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
      title: $i18n.neurons.title,
      cellComponent: ProjectNeuronsCell,
      alignment: "right",
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
    isSignedIn: $authSignedInStore,
    nnsNeurons: $neuronsStore?.neurons,
    snsNeurons: $snsNeuronsStore,
  });
</script>

<ResponsiveTable
  testId="projects-table-component"
  tableData={tableProjects}
  {columns}
></ResponsiveTable>

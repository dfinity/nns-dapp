<script lang="ts">
  import ProjectActionsCell from "$lib/components/staking/ProjectActionsCell.svelte";
  import ProjectMaturityCell from "$lib/components/staking/ProjectMaturityCell.svelte";
  import ProjectNeuronsCell from "$lib/components/staking/ProjectNeuronsCell.svelte";
  import ProjectStakeCell from "$lib/components/staking/ProjectStakeCell.svelte";
  import ProjectTitleCell from "$lib/components/staking/ProjectTitleCell.svelte";
  import ResponsiveTable from "$lib/components/ui/ResponsiveTable.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { icpSwapUsdPricesStore } from "$lib/derived/icp-swap.derived";
  import { selectableUniversesStore } from "$lib/derived/selectable-universes.derived";
  import { loadIcpSwapTickers } from "$lib/services/icp-swap.services";
  import { ENABLE_USD_VALUES_FOR_NEURONS } from "$lib/stores/feature-flags.store";
  import { i18n } from "$lib/stores/i18n";
  import { neuronsStore } from "$lib/stores/neurons.store";
  import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
  import type { ProjectsTableColumn, TableProject } from "$lib/types/staking";
  import {
    getTableProjects,
    sortTableProjects,
  } from "$lib/utils/staking.utils";
  import { createEventDispatcher } from "svelte";

  $: if ($authSignedInStore && $ENABLE_USD_VALUES_FOR_NEURONS) {
    loadIcpSwapTickers();
  }

  const columns: ProjectsTableColumn[] = [
    {
      title: $i18n.staking.nervous_systems,
      cellComponent: ProjectTitleCell,
      alignment: "left",
      templateColumns: ["minmax(min-content, max-content)"],
    },
    {
      title: "",
      alignment: "left",
      templateColumns: ["1fr"],
    },
    {
      title: $i18n.neuron_detail.stake,
      cellComponent: ProjectStakeCell,
      alignment: "right",
      templateColumns: ["max-content"],
    },
    {
      title: "",
      alignment: "left",
      templateColumns: ["1fr"],
    },
    {
      title: $i18n.neuron_detail.maturity_title,
      cellComponent: ProjectMaturityCell,
      alignment: "right",
      templateColumns: ["max-content"],
    },
    {
      title: "",
      alignment: "left",
      templateColumns: ["1fr"],
    },
    {
      title: $i18n.neurons.title,
      cellComponent: ProjectNeuronsCell,
      alignment: "right",
      templateColumns: ["max-content"],
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
    icpSwapUsdPrices: $icpSwapUsdPricesStore,
  });

  let sortedTableProjects: TableProject[];
  $: sortedTableProjects = sortTableProjects(tableProjects);

  const dispatcher = createEventDispatcher();

  const handleAction = ({
    detail: { rowData },
  }: {
    detail: { rowData: TableProject };
  }) => {
    if (rowData.neuronCount === 0) {
      dispatcher("nnsStakeTokens", { universeId: rowData.universeId });
    }
  };
</script>

<ResponsiveTable
  testId="projects-table-component"
  tableData={sortedTableProjects}
  {columns}
  on:nnsAction={handleAction}
></ResponsiveTable>

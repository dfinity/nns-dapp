<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import ResponsiveTable from "$lib/components/ui/ResponsiveTable.svelte";
  import type {
    TableNeuron,
    NeuronsTableColumn,
  } from "$lib/types/neurons-table";
  import NeuronIdCell from "$lib/components/neurons/NeuronsTable/NeuronIdCell.svelte";
  import NeuronStateCell from "$lib/components/neurons/NeuronsTable/NeuronStateCell.svelte";
  import NeuronStakeCell from "$lib/components/neurons/NeuronsTable/NeuronStakeCell.svelte";
  import NeuronDissolveDelayCell from "$lib/components/neurons/NeuronsTable/NeuronDissolveDelayCell.svelte";
  import NeuronActionsCell from "$lib/components/neurons/NeuronsTable/NeuronActionsCell.svelte";
  import {
    sortNeurons,
    compareByStake,
    compareByDissolveDelay,
    compareById,
  } from "$lib/utils/neurons-table.utils";

  export let neurons: TableNeuron[];

  const order = [compareByStake, compareByDissolveDelay, compareById];

  let sortedNeurons: TableNeuron[];
  $: sortedNeurons = sortNeurons({
    neurons,
    order,
  });

  const columns: NeuronsTableColumn[] = [
    {
      title: $i18n.neurons.neuron_id,
      cellComponent: NeuronIdCell,
      alignment: "left",
      templateColumns: ["1fr"],
    },
    {
      title: $i18n.neuron_detail.stake,
      cellComponent: NeuronStakeCell,
      alignment: "right",
      templateColumns: ["max-content"],
    },
    {
      title: $i18n.neurons.state,
      cellComponent: NeuronStateCell,
      alignment: "left",
      templateColumns: ["max-content"],
    },
    {
      title: $i18n.neurons.dissolve_delay_title,
      cellComponent: NeuronDissolveDelayCell,
      alignment: "right",
      templateColumns: ["max-content"],
    },
    {
      title: "",
      cellComponent: NeuronActionsCell,
      alignment: "right",
      templateColumns: ["max-content"],
    },
  ];
</script>

<ResponsiveTable
  testId="neurons-table-component"
  {columns}
  tableData={sortedNeurons}
></ResponsiveTable>

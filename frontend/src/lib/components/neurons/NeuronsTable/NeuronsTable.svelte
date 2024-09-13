<script lang="ts">
  import NeuronActionsCell from "$lib/components/neurons/NeuronsTable/NeuronActionsCell.svelte";
  import NeuronDissolveDelayCell from "$lib/components/neurons/NeuronsTable/NeuronDissolveDelayCell.svelte";
  import NeuronIdCell from "$lib/components/neurons/NeuronsTable/NeuronIdCell.svelte";
  import NeuronMaturityCell from "$lib/components/neurons/NeuronsTable/NeuronMaturityCell.svelte";
  import NeuronStakeCell from "$lib/components/neurons/NeuronsTable/NeuronStakeCell.svelte";
  import NeuronStateCell from "$lib/components/neurons/NeuronsTable/NeuronStateCell.svelte";
  import ResponsiveTable from "$lib/components/ui/ResponsiveTable.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { neuronsTableOrderStore } from "$lib/stores/neurons-table.store";
  import type {
    TableNeuron,
    NeuronsTableColumn,
  } from "$lib/types/neurons-table";
  import {
    compareByDissolveDelay,
    compareById,
    compareByMaturity,
    compareByStake,
    compareByState,
  } from "$lib/utils/neurons-table.utils";
  import { NeuronState } from "@dfinity/nns";

  export let neurons: TableNeuron[];

  // Make sure there is a consistent order even if the selected sorting
  // criteria don't tiebreak all neurons.
  let neuronsSortedById: TableNeuron[];
  $: neuronsSortedById = [...neurons].sort(compareById);

  const columns: NeuronsTableColumn[] = [
    {
      id: "id",
      title: $i18n.neurons.title,
      cellComponent: NeuronIdCell,
      alignment: "left",
      templateColumns: ["minmax(min-content, max-content)"],
    },
    {
      title: "",
      alignment: "left",
      templateColumns: ["1fr"],
    },
    {
      id: "stake",
      title: $i18n.neuron_detail.stake,
      cellComponent: NeuronStakeCell,
      alignment: "right",
      templateColumns: ["max-content"],
      comparator: compareByStake,
    },
    {
      title: "",
      alignment: "left",
      templateColumns: ["1fr"],
    },
    {
      id: "maturity",
      title: $i18n.neuron_detail.maturity_title,
      cellComponent: NeuronMaturityCell,
      alignment: "right",
      templateColumns: ["max-content"],
      comparator: compareByMaturity,
    },
    {
      title: "",
      alignment: "left",
      templateColumns: ["1fr"],
    },
    {
      id: "dissolveDelay",
      title: $i18n.neurons.dissolve_delay_title,
      cellComponent: NeuronDissolveDelayCell,
      alignment: "left",
      templateColumns: ["max-content"],
      comparator: compareByDissolveDelay,
    },
    {
      title: "",
      alignment: "left",
      templateColumns: ["1fr"],
    },
    {
      id: "state",
      title: $i18n.neurons.state,
      cellComponent: NeuronStateCell,
      alignment: "left",
      templateColumns: ["max-content"],
      comparator: compareByState,
    },
    {
      title: "",
      cellComponent: NeuronActionsCell,
      alignment: "right",
      templateColumns: ["max-content"],
    },
  ];

  const getRowStyle = (neuron: TableNeuron) => {
    if (neuron.state === NeuronState.Spawning) {
      return "--table-row-text-color: var(--text-description-tint); --elements-icons:var(--tertiary);";
    }
    return "--elements-icons:var(--tertiary);";
  };
</script>

<ResponsiveTable
  testId="neurons-table-component"
  {columns}
  tableData={neuronsSortedById}
  bind:order={$neuronsTableOrderStore}
  {getRowStyle}
></ResponsiveTable>

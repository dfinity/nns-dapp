<script lang="ts">
  import NeuronActionsCell from "$lib/components/neurons/NeuronsTable/NeuronActionsCell.svelte";
  import NeuronApyCell from "$lib/components/neurons/NeuronsTable/NeuronApyCell.svelte";
  import NeuronDissolveDelayCell from "$lib/components/neurons/NeuronsTable/NeuronDissolveDelayCell.svelte";
  import NeuronIdCell from "$lib/components/neurons/NeuronsTable/NeuronIdCell.svelte";
  import NeuronMaturityCell from "$lib/components/neurons/NeuronsTable/NeuronMaturityCell.svelte";
  import NeuronStakeCell from "$lib/components/neurons/NeuronsTable/NeuronStakeCell.svelte";
  import NeuronStateCell from "$lib/components/neurons/NeuronsTable/NeuronStateCell.svelte";
  import NeuronVoteDelegationCell from "$lib/components/neurons/NeuronsTable/NeuronVoteDelegationCell.svelte";
  import ResponsiveTable from "$lib/components/ui/ResponsiveTable.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { neuronsTableOrderStore } from "$lib/stores/neurons-table.store";
  import type {
    NeuronsTableColumn,
    TableNeuron,
  } from "$lib/types/neurons-table";
  import {
    comparatorsByColumnId,
    compareById,
  } from "$lib/utils/neurons-table.utils";
  import { NeuronState } from "@dfinity/nns";
  import { nonNullish } from "@dfinity/utils";

  type Props = {
    neurons: TableNeuron[];
  };
  const { neurons }: Props = $props();

  // Make sure there is a consistent order even if the selected sorting
  // criteria don't tiebreak all neurons.
  // Make sure to update neurons-table-order-sorted-neuron-ids-store.utils when sorting is changed
  const neuronsSortedById = $derived([...neurons].sort(compareById));
  const hasVoteDelegationState = $derived(
    neuronsSortedById.some((neuron) => nonNullish(neuron.voteDelegationState))
  );

  const columns = $derived(
    (
      [
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
        },
        {
          title: "",
          alignment: "left",
          templateColumns: ["1fr"],
        },
        {
          id: "apy",
          title: $i18n.neuron_detail.apy_and_max,
          cellComponent: NeuronApyCell,
          alignment: "right",
          templateColumns: ["max-content"],
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
        },
        {
          title: "",
          alignment: "left",
          templateColumns: ["1fr"],
        },
        ...(hasVoteDelegationState
          ? [
              {
                id: "voteDelegation",
                title: $i18n.neuron_detail.vote_delegation_title,
                cellComponent: NeuronVoteDelegationCell,
                alignment: "left",
                templateColumns: ["max-content"],
              },
              {
                title: "",
                alignment: "left",
                templateColumns: ["1fr"],
              },
            ]
          : []),
        {
          id: "dissolveDelay",
          title: $i18n.neurons.dissolve_delay_title,
          cellComponent: NeuronDissolveDelayCell,
          alignment: "left",
          templateColumns: ["max-content"],
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
        },
        {
          title: "",
          cellComponent: NeuronActionsCell,
          alignment: "right",
          templateColumns: ["max-content"],
        },
      ] as NeuronsTableColumn[]
    ).map((column) => ({
      ...column,
      ...(column.id &&
        comparatorsByColumnId[column.id] && {
          comparator: comparatorsByColumnId[column.id],
        }),
    }))
  );

  const getRowStyle = (neuron: TableNeuron) => {
    if (neuron.state === NeuronState.Spawning) {
      return "--table-row-text-color: var(--text-description-tint); --elements-icons:var(--table-row-text-color);";
    }
    return undefined;
  };
</script>

<ResponsiveTable
  testId="neurons-table-component"
  {columns}
  tableData={neuronsSortedById}
  bind:order={$neuronsTableOrderStore}
  {getRowStyle}
  displayTableSettings
></ResponsiveTable>

<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import ResponsiveTable from "$lib/components/ui/ResponsiveTable.svelte";
  import type {
    TableNeuron,
    NeuronsTableColumn,
  } from "$lib/types/neurons-table";
  import NeuronIdCell from "$lib/components/neurons/NeuronsTable/NeuronIdCell.svelte";
  import NeuronStakeCell from "$lib/components/neurons/NeuronsTable/NeuronStakeCell.svelte";
  import NeuronActionsCell from "$lib/components/neurons/NeuronsTable/NeuronActionsCell.svelte";

  export let neurons: TableNeuron[];

  const columns: NeuronsTableColumn[] = [
    {
      title: $i18n.neurons.neuron_id,
      cellComponent: NeuronIdCell,
    },
    {
      title: $i18n.neuron_detail.stake,
      cellComponent: NeuronStakeCell,
    },
    {
      title: "",
      cellComponent: NeuronActionsCell,
    },
  ];
</script>

<ResponsiveTable testId="neurons-table-component" {columns} tableData={neurons}
></ResponsiveTable>

<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconDown } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";

  type Neuron = {
    availableMaturity: bigint;
    dissolveDelaySeconds: bigint;
    isPublic: boolean;
    neuronId: string;
    stakedMaturity: bigint;
    state: number;
  };

  const dispatcher = createEventDispatcher();

  const exportNeurons = () => {
    dispatcher("nnsExportNeuronsCSVTriggered");

    // somehow consume list of neurons from somewhere
    //
  };

  // Function to convert BigInt to number and prepare data for CSV
  function prepareDataForCsv(data: Neuron[]) {
    return data.map((neuron) => ({
      ...neuron,
      availableMaturity: Number(neuron.availableMaturity),
      dissolveDelaySeconds: Number(neuron.dissolveDelaySeconds),
      stakedMaturity: Number(neuron.stakedMaturity),
    }));
  }

  // Function to convert object array to CSV string
  function convertToCSV(data: Record<string, any>[]) {
    // Get headers from the first object
    const headers = Object.keys(data[0]);

    // Create CSV header row
    const csvRows = [headers.join(",")];

    // Add data rows
    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header];
        // Handle special cases (like strings with commas)
        return typeof value === "string" && value.includes(",")
          ? `"${value}"`
          : value;
      });
      csvRows.push(values.join(","));
    }

    return csvRows.join("\n");
  }

  const neurons = [
    {
      availableMaturity: 0n,
      dissolveDelaySeconds: 252460800n,
      isPublic: false,
      neuronId: "10580015128542197304",
      stakedMaturity: 0n,
      state: 1,
    },
    {
      availableMaturity: 0n,
      dissolveDelaySeconds: 252460800n,
      isPublic: false,
      neuronId: "3",
      stakedMaturity: 0n,
      state: 1,
    },
  ];

  // Function to trigger download
  function downloadCSV() {
    // Prepare the data
    const preparedData = prepareDataForCsv(neurons);
    const csvContent = convertToCSV(preparedData);

    // Create blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    // Create download URL
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "neurons.csv");

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
</script>

<button data-tid="logout" on:click={downloadCSV} class="text">
  <IconDown />
  {$i18n.header.export_neurons}
</button>

<style lang="scss">
  @use "../../themes/mixins/account-menu";

  button {
    @include account-menu.button;
    padding: 0;
  }
</style>

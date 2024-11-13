<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconDown } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";
  import { neuronsStore } from "$lib/stores/neurons.store";
  import {
    getStateInfo,
    neuronAvailableMaturity,
    neuronStake,
    neuronStakedMaturity,
  } from "$lib/utils/neuron.utils";
  import { ICPToken, secondsToDuration, TokenAmountV2 } from "@dfinity/utils";
  import { formatTokenV2 } from "$lib/utils/token.utils";
  import type { NeuronInfo, NeuronState } from "@dfinity/nns";

  // to src/lib/types/neurons-table.ts ??
  type ExportNeuron = {
    neuronId: string;
    stake: TokenAmountV2;
    availableMaturity: bigint;
    stakedMaturity: bigint;
    dissolveDelaySeconds: bigint;
    dissolveDate: Date;
    state: NeuronState;
  };

  // Component code
  const dispatcher = createEventDispatcher<{
    nnsExportNeuronsCSVTriggered: void;
  }>();

  let isDisabled = true;
  $: isDisabled = $neuronsStore.neurons === undefined;

  let neurons: NeuronInfo[] = $neuronsStore?.neurons ?? [];

  // End of component code


  // to src/lib/utils/neurons-export.utils.ts ??
  const getNeuronsForExport = (neurons: NeuronInfo[]) => {
    return neurons.map((neuron) => ({
      neuronId: neuron.neuronId.toString(),
      stake: TokenAmountV2.fromUlps({
        amount: neuronStake(neuron),
        token: ICPToken,
      }),
      availableMaturity: neuronAvailableMaturity(neuron),
      stakedMaturity: neuronStakedMaturity(neuron),
      dissolveDelaySeconds: neuron.dissolveDelaySeconds,
      dissolveDate: getDateFromSeconds(neuron.dissolveDelaySeconds),
      state: neuron.state,
    }));
  };

  const renderExportNeurons = (neurons: ExportNeuron[]) => {
    return neurons.map((neuron) => {
      return {
        id: neuron.neuronId,
        stake: formatTokenV2({
          value: neuron.stake,
          detailed: true,
        }),
        availableMaturity: neuron.availableMaturity,
        stakedMaturity: neuron.stakedMaturity,
        dissolveDelay: secondsToDuration({
          seconds: neuron.dissolveDelaySeconds,
          i18n: $i18n.time,
        }),
        dissolveDate: neuron.dissolveDate.toLocaleString(),
        state: $i18n.neuron_state[getStateInfo(neuron.state).textKey],
      };
    });
  };

  const exportNeurons = () => {
    try {
      const neuronsforExport = getNeuronsForExport(neurons);
      const renderableNeurons = renderExportNeurons(neuronsforExport);

      downloadCSV(renderableNeurons);
    } catch (error) {
      console.error("Error exporting neurons:", error);
      // Handle error appropriately, what can go wrong?
    } finally {
      dispatcher("nnsExportNeuronsCSVTriggered");
    }
  };

  // Basic function - helper function
  function getDateFromSeconds(seconds: number | bigint): Date {
    const now = new Date();
    const futureDate = new Date(now.getTime() + Number(seconds) * 1000);
    return futureDate;
  }

  // Move all to some export-neurons utils file or similar
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

  // Move all to some export-neurons utils file or similar
  async function downloadCSV(neurons: Record<string, any>[]) {
    const csvContent = convertToCSV(neurons);
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    // Use native file system API if available
    if (window.showSaveFilePicker) {
      const handle = await window.showSaveFilePicker({
        suggestedName: "neurons.csv",
        types: [
          {
            description: "CSV File",
            accept: { "text/csv": [".csv"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
    } else {
      // Fallback for browsers without File System API
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "neurons.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }
</script>

<button
  data-tid="export-neurons-button"
  on:click={exportNeurons}
  class="text"
  disabled={isDisabled}
  aria-label={$i18n.header.export_neurons}
>
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

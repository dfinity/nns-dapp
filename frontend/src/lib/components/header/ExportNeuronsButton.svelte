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

  // Basic function
  function getDateFromSeconds(seconds: number | bigint): Date {
    const now = new Date();
    const futureDate = new Date(now.getTime() + Number(seconds) * 1000);
    return futureDate;
  }

  let isDisabled = true;
  $: isDisabled = $neuronsStore.neurons === undefined;
  let neurons: {}[] =
    $neuronsStore.neurons?.map((neuron) => ({
      id: neuron.neuronId,
      stake: formatTokenV2({
        value: TokenAmountV2.fromUlps({
          amount: neuronStake(neuron),
          token: ICPToken,
        }),
        detailed: true,
      }),
      availableMaturity: neuronAvailableMaturity(neuron),
      stakedMaturity: neuronStakedMaturity(neuron),
      dissolveDelay: secondsToDuration({
        seconds: neuron.dissolveDelaySeconds,
        i18n: $i18n.time,
      }),
      dissolveDate: getDateFromSeconds(neuron.dissolveDelaySeconds).toLocaleString(),
      state: $i18n.neuron_state[getStateInfo(neuron.state).textKey],
    })) ?? [];

  $: console.log(neurons);

  const dispatcher = createEventDispatcher();

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

  function downloadCSV() {
    const csvContent = convertToCSV(neurons);

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "neurons.csv");

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    dispatcher("nnsExportNeuronsCSVTriggered");
  }
</script>

<button
  data-tid="export-neurons-button"
  on:click={downloadCSV}
  class="text"
  disabled={isDisabled}
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

<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconDown } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";
  import { neuronsStore } from "$lib/stores/neurons.store";
  import {
    formatMaturity,
    getStateInfo,
    neuronAvailableMaturity,
    neuronStake,
    neuronStakedMaturity,
  } from "$lib/utils/neuron.utils";
  import { ICPToken, secondsToDuration, TokenAmountV2 } from "@dfinity/utils";
  import { formatTokenV2 } from "$lib/utils/token.utils";
  import { NeuronState, type NeuronInfo } from "@dfinity/nns";
  import {
    CsvGenerationError,
    FileSystemAccessError,
    generateCsvFileToSave,
  } from "$lib/utils/export-to-csv.utils";
  import { toastsError } from "$lib/stores/toasts.store";
  import {
    getFutureDateFromDelayInSeconds,
    secondsToDate,
  } from "$lib/utils/date.utils";

  const dispatcher = createEventDispatcher<{
    nnsExportNeuronsCSVTriggered: void;
  }>();

  let isDisabled = true;
  let neurons: NeuronInfo[] = [];

  $: neurons = $neuronsStore?.neurons ?? [];
  $: isDisabled = !neurons.length;

  const neuronToHumanReadableFormat = (neuron: NeuronInfo) => {
    const neuronId = neuron.neuronId.toString();
    const stake = TokenAmountV2.fromUlps({
      amount: neuronStake(neuron),
      token: ICPToken,
    });
    const availableMaturity = neuronAvailableMaturity(neuron);
    const stakedMaturity = neuronStakedMaturity(neuron);
    const dissolveDelaySeconds = neuron.dissolveDelaySeconds;
    const dissolveDate =
      neuron.state === NeuronState.Dissolving
        ? getFutureDateFromDelayInSeconds(neuron.dissolveDelaySeconds)
        : null;
    const creationDate = secondsToDate(Number(neuron.createdTimestampSeconds));

    return {
      neuronId,
      stake: formatTokenV2({
        value: stake,
        detailed: true,
      }),
      availableMaturity: formatMaturity(availableMaturity),
      stakedMaturity: formatMaturity(stakedMaturity),
      dissolveDelaySeconds: secondsToDuration({
        seconds: dissolveDelaySeconds,
        i18n: $i18n.time,
      }),
      dissolveDate: dissolveDate ?? "N/A",
      creationDate,
      state: $i18n.neuron_state[getStateInfo(neuron.state).textKey],
    };
  };

  const exportNeurons = async () => {
    try {
      const humanFriendlyContent = neurons.map(neuronToHumanReadableFormat);

      if (!humanFriendlyContent.length) {
        toastsError({
          labelKey: "export_error.no_neurons",
        });
        return;
      }

      await generateCsvFileToSave({
        data: humanFriendlyContent,
        headers: [
          {
            id: "neuronId",
            label: $i18n.export_csv_neurons.neuron_id,
          },
          {
            id: "stake",
            label: $i18n.export_csv_neurons.stake,
          },
          {
            id: "availableMaturity",
            label: $i18n.export_csv_neurons.available_maturity,
          },
          {
            id: "stakedMaturity",
            label: $i18n.export_csv_neurons.staked_maturity,
          },
          {
            id: "dissolveDelaySeconds",
            label: $i18n.export_csv_neurons.dissolve_delay,
          },
          {
            id: "dissolveDate",
            label: $i18n.export_csv_neurons.dissolve_date,
          },
          {
            id: "creationDate",
            label: $i18n.export_csv_neurons.creation_date,
          },
          {
            id: "state",
            label: $i18n.export_csv_neurons.state,
          },
        ],
        fileName: "neurons",
      });
    } catch (error) {
      console.error("Error exporting neurons:", error);

      if (error instanceof FileSystemAccessError) {
        toastsError({
          labelKey: "export_error.file_system_access",
        });
      } else if (error instanceof CsvGenerationError) {
        toastsError({
          labelKey: "export_error.csv_generation",
        });
      } else {
        toastsError({
          labelKey: "export_error.neurons",
        });
      }
    } finally {
      dispatcher("nnsExportNeuronsCSVTriggered");
    }
  };
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

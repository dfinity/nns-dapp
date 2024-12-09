<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconDown } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";
  import { neuronsStore } from "$lib/stores/neurons.store";
  import { isNullish } from "@dfinity/utils";
  import {
    buildNeuronsDatasets,
    CsvGenerationError,
    FileSystemAccessError,
    generateCsvFileToSave,
    type CsvHeader,
    type NeuronsCsvData,
  } from "$lib/utils/export-to-csv.utils";
  import { toastsError } from "$lib/stores/toasts.store";
  import { formatDateCompact } from "$lib/utils/date.utils";
  import { authStore } from "$lib/stores/auth.store";
  import type { NeuronInfo } from "@dfinity/nns";
  import type { Principal } from "@dfinity/principal";

  const dispatcher = createEventDispatcher<{
    nnsExportNeuronsCsvTriggered: void;
  }>();

  let isDisabled = true;
  let neurons: NeuronInfo[] = [];
  let nnsAccountPrincipal: Principal | null | undefined;

  $: neurons = $neuronsStore?.neurons ?? [];
  $: nnsAccountPrincipal = $authStore.identity?.getPrincipal();
  $: isDisabled = neurons.length === 0 || isNullish(nnsAccountPrincipal);

  const exportNeurons = async () => {
    if (!nnsAccountPrincipal) return;

    try {
      const datasets = buildNeuronsDatasets({
        neurons,
        nnsAccountPrincipal,
        i18n: $i18n,
      });
      const headers: CsvHeader<NeuronsCsvData>[] = [
        {
          id: "neuronId",
          label: $i18n.export_csv_neurons.neuron_id,
        },
        {
          id: "project",
          label: $i18n.export_csv_neurons.project,
        },
        {
          id: "symbol",
          label: $i18n.export_csv_neurons.symbol,
        },
        {
          id: "neuronAccountId",
          label: $i18n.export_csv_neurons.neuron_account_id,
        },
        {
          id: "controllerId",
          label: $i18n.export_csv_neurons.controller_id,
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
      ];
      const fileName = `neurons_export_${formatDateCompact(new Date())}`;

      await generateCsvFileToSave({
        datasets,
        headers,
        fileName,
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
      dispatcher("nnsExportNeuronsCsvTriggered");
    }
  };
</script>

<button
  data-tid="export-neurons-button-component"
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

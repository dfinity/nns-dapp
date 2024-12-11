<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconDown } from "@dfinity/gix-components";
  import {
    buildNeuronsDatasets,
    CsvGenerationError,
    FileSystemAccessError,
    generateCsvFileToSave,
  } from "$lib/utils/export-to-csv.utils";
  import { toastsError } from "$lib/stores/toasts.store";
  import { formatDateCompact } from "$lib/utils/date.utils";
  import { authStore } from "$lib/stores/auth.store";
  import type { NeuronInfo } from "@dfinity/nns";
  import type { Identity, SignIdentity } from "@dfinity/agent";
  import { queryNeurons } from "$lib/api/governance.api";
  import { sortNeuronsByStake } from "$lib/utils/neuron.utils";

  let identity: Identity | null | undefined;
  let loading = false;

  $: identity = $authStore.identity;

  const fetchAllNnsNeuronsAndSortThemByStake = async (
    identity: Identity
  ): Promise<NeuronInfo[]> => {
    const data = await queryNeurons({
      certified: true,
      identity: identity,
      includeEmptyNeurons: true,
    });

    return sortNeuronsByStake(data);
  };

  const exportNeurons = async () => {
    try {
      loading = true;

      // we are logged in to be able to interact with the button
      const signIdentity = identity as SignIdentity;

      const neurons = await fetchAllNnsNeuronsAndSortThemByStake(signIdentity);
      const fileName = `neurons_export_${formatDateCompact(new Date())}`;

      await generateCsvFileToSave({
        datasets: buildNeuronsDatasets({
          neurons,
          nnsAccountPrincipal: signIdentity.getPrincipal(),
          i18n: $i18n,
        }),
        headers: [
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
        ],
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
      loading = false;
    }
  };
</script>

<button
  data-tid="reporting-neurons-button-component"
  on:click={exportNeurons}
  class="primary with-icon"
  disabled={loading}
  aria-label={$i18n.reporting.neurons_download}
>
  <IconDown />
  {$i18n.reporting.neurons_download}
</button>

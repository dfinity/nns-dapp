<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconDown } from "@dfinity/gix-components";
  import {
    buildNeuronsDatasets,
    CsvGenerationError,
    FileSystemAccessError,
    generateCsvFileToSave,
  } from "$lib/utils/reporting.utils";
  import { toastsError } from "$lib/stores/toasts.store";
  import { formatDateCompact } from "$lib/utils/date.utils";
  import type { NeuronInfo } from "@dfinity/nns";
  import type { Identity } from "@dfinity/agent";
  import { queryNeurons } from "$lib/api/governance.api";
  import { sortNeuronsByStake } from "$lib/utils/neuron.utils";
  import { getAuthenticatedIdentity } from "$lib/services/auth.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";

  let loading = false;

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
      startBusy({
        initiator: "reporting-neurons",
        labelKey: "reporting.busy_screen",
      });

      // we are logged in to be able to interact with the button
      const signIdentity = await getAuthenticatedIdentity();

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
            label: $i18n.reporting.neuron_id,
          },
          {
            id: "project",
            label: $i18n.reporting.project,
          },
          {
            id: "symbol",
            label: $i18n.reporting.symbol,
          },
          {
            id: "neuronAccountId",
            label: $i18n.reporting.neuron_account_id,
          },
          {
            id: "controllerId",
            label: $i18n.reporting.controller_id,
          },
          {
            id: "stake",
            label: $i18n.reporting.stake,
          },
          {
            id: "availableMaturity",
            label: $i18n.reporting.available_maturity,
          },
          {
            id: "stakedMaturity",
            label: $i18n.reporting.staked_maturity,
          },
          {
            id: "dissolveDelaySeconds",
            label: $i18n.reporting.dissolve_delay,
          },
          {
            id: "dissolveDate",
            label: $i18n.reporting.dissolve_date,
          },
          {
            id: "creationDate",
            label: $i18n.reporting.creation_date,
          },
          {
            id: "state",
            label: $i18n.reporting.state,
          },
        ],
        fileName,
      });
    } catch (error) {
      console.error("Error exporting neurons:", error);

      if (error instanceof FileSystemAccessError) {
        toastsError({
          labelKey: "reporting.error_file_system_access",
        });
      } else if (error instanceof CsvGenerationError) {
        toastsError({
          labelKey: "reporting.error_csv_generation",
        });
      } else {
        toastsError({
          labelKey: "reporting.error_neurons",
        });
      }
    } finally {
      loading = false;
      stopBusy("reporting-neurons");
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

<script lang="ts">
  import { queryNeurons } from "$lib/api/governance.api";
  import { querySnsNeurons } from "$lib/api/sns-governance.api";
  import { snsProjectsActivePadStore } from "$lib/derived/sns/sns-projects.derived";
  import { getAuthenticatedIdentity } from "$lib/services/auth.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsError } from "$lib/stores/toasts.store";
  import type { ReportingNeuronsSource } from "$lib/types/reporting";
  import { formatDateCompact } from "$lib/utils/date.utils";
  import { sortNeuronsByStake } from "$lib/utils/neuron.utils";
  import {
    CsvGenerationError,
    FileSystemAccessError,
  } from "$lib/utils/reporting.save-csv-to-file.utils";
  import {
    buildNeuronsDatasets,
    buildSnsNeuronsDatasets,
    generateCsvFileToSave,
    mapPool,
  } from "$lib/utils/reporting.utils";
  import { sortSnsNeuronsByStake } from "$lib/utils/sns-neuron.utils";
  import { IconDown } from "@dfinity/gix-components";

  type Props = { source?: ReportingNeuronsSource };
  let { source = "nns" }: Props = $props();

  let inProgress = $state(false);

  const snsProjects = $derived($snsProjectsActivePadStore);
  const snsProjectsNotLoaded = $derived(
    source === "sns" && snsProjects.length === 0
  );
  const fileName = $derived(
    source === "sns"
      ? `neurons_export_sns_${formatDateCompact(new Date())}`
      : `neurons_export_nns_${formatDateCompact(new Date())}`
  );

  const exportNeurons = async () => {
    try {
      inProgress = true;
      startBusy({
        initiator: "reporting-neurons",
        labelKey: "reporting.busy_screen",
      });

      // we are logged in to be able to interact with the button
      const identity = await getAuthenticatedIdentity();

      if (source === "sns") {
        // This flow will take some time so we update the message to users to indicate progress
        setTimeout(() => {
          startBusy({
            initiator: "reporting-neurons",
            labelKey: "reporting.busy_screen_sns_getting_neurons",
          });
        }, 4000);

        const promises = await mapPool(snsProjects, (project) =>
          querySnsNeurons({
            identity,
            rootCanisterId: project.rootCanisterId,
            certified: true,
          })
        );

        const didSomeProjectFail = promises.some(
          (p) => p.status === "rejected"
        );
        if (didSomeProjectFail) {
          toastsError({
            labelKey: "reporting.error_some_sns_projects",
          });
        }

        startBusy({
          initiator: "reporting-neurons",
          labelKey: "reporting.busy_screen",
        });

        const neurons = promises
          .filter((p) => p.status === "fulfilled")
          .flatMap((p) => {
            return sortSnsNeuronsByStake(p.value).map((n) => ({
              ...n,
              governanceCanisterId: p.item.summary.governanceCanisterId,
              token: p.item.summary.token,
            }));
          });

        const datasets = buildSnsNeuronsDatasets({
          neurons,
          userPrincipal: identity.getPrincipal(),
          i18n: $i18n,
        });

        await generateCsvFileToSave({
          datasets,
          headers: [
            { id: "project", label: $i18n.reporting.project },
            { id: "neuronId", label: $i18n.reporting.neuron_id },
            {
              id: "neuronAccountId",
              label: $i18n.reporting.neuron_account_id,
            },
            { id: "stake", label: $i18n.reporting.stake },
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
            { id: "dissolveDate", label: $i18n.reporting.dissolve_date },
            { id: "creationDate", label: $i18n.reporting.creation_date },
            { id: "state", label: $i18n.reporting.state },
          ],
          fileName,
        });
      } else {
        const data = await queryNeurons({
          certified: true,
          identity: identity,
          includeEmptyNeurons: true,
        });

        const neurons = sortNeuronsByStake(data);

        await generateCsvFileToSave({
          datasets: buildNeuronsDatasets({
            neurons,
            nnsAccountPrincipal: identity.getPrincipal(),
            i18n: $i18n,
          }),
          headers: [
            { id: "project", label: $i18n.reporting.project },
            { id: "neuronId", label: $i18n.reporting.neuron_id },
            {
              id: "neuronAccountId",
              label: $i18n.reporting.neuron_account_id,
            },
            { id: "controllerId", label: $i18n.reporting.controller_id },
            { id: "stake", label: $i18n.reporting.stake },
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
            { id: "dissolveDate", label: $i18n.reporting.dissolve_date },
            { id: "creationDate", label: $i18n.reporting.creation_date },
            { id: "state", label: $i18n.reporting.state },
          ],
          fileName,
        });
      }
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
      inProgress = false;
      stopBusy("reporting-neurons");
    }
  };
</script>

<div class="wrapper">
  <button
    data-tid="reporting-neurons-button-component"
    onclick={exportNeurons}
    class="primary with-icon"
    disabled={inProgress || snsProjectsNotLoaded}
    aria-label={$i18n.reporting.neurons_download}
  >
    <IconDown />
    {$i18n.reporting.neurons_download}
  </button>

  {#if source === "sns" && snsProjectsNotLoaded}
    <p class="hint">{$i18n.reporting.loading_sns_projects}</p>
  {/if}
</div>

<style lang="scss">
  .wrapper {
    display: flex;
    align-items: center;
    gap: var(--padding);
    width: 100%;

    .hint {
      font-size: var(--font-size-small);
      color: var(--text-description);
      margin: 0;
      font-style: italic;
    }
  }
</style>

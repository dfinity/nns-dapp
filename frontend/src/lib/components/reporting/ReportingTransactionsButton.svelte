<script lang="ts">
  import { queryNeurons } from "$lib/api/governance.api";
  import { nnsAccountsListStore } from "$lib/derived/accounts-list.derived";
  import { createSwapCanisterAccountsStore } from "$lib/derived/sns-swap-canisters-accounts.derived";
  import { getAccountTransactionsConcurrently } from "$lib/services/reporting.services";
  import { authStore } from "$lib/stores/auth.store";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsError } from "$lib/stores/toasts.store";
  import type { Account } from "$lib/types/account";
  import type { ReportingPeriod } from "$lib/types/reporting";
  import { formatDateCompact } from "$lib/utils/date.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { sortNeuronsByStake } from "$lib/utils/neuron.utils";
  import {
    CsvGenerationError,
    FileSystemAccessError,
  } from "$lib/utils/reporting.save-csv-to-file.utils";
  import {
    buildTransactionsDatasets,
    convertPeriodToNanosecondRange,
    generateCsvFileToSave,
    type CsvHeader,
    type TransactionsCsvData,
  } from "$lib/utils/reporting.utils";
  import { SignIdentity, type Identity } from "@dfinity/agent";
  import { IconDown } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import { ICPToken, nonNullish } from "@dfinity/utils";
  import type { Readable } from "svelte/store";

  export let period: ReportingPeriod = "all";

  let identity: Identity | null | undefined;
  let swapCanisterAccounts: Set<string>;
  let nnsAccounts: Account[];
  let swapCanisterAccountsStore: Readable<Set<string>>;
  let loading = false;

  $: identity = $authStore.identity;
  $: nnsAccounts = $nnsAccountsListStore;
  $: swapCanisterAccountsStore = createSwapCanisterAccountsStore(
    identity?.getPrincipal()
  );
  $: swapCanisterAccounts = $swapCanisterAccountsStore ?? new Set();

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

  const exportIcpTransactions = async () => {
    try {
      loading = true;
      startBusy({
        initiator: "reporting-transactions",
        labelKey: "reporting.busy_screen",
      });

      // we are logged in to be able to interact with the button
      const signIdentity = identity as SignIdentity;

      const nnsNeurons =
        await fetchAllNnsNeuronsAndSortThemByStake(signIdentity);
      const neuronAccounts = new Set(
        nnsNeurons
          .filter((neuron) => nonNullish(neuron.fullNeuron?.accountIdentifier))
          .map((neuron) => neuron.fullNeuron!.accountIdentifier)
      );

      const entities = [...nnsAccounts, ...nnsNeurons];
      const range = convertPeriodToNanosecondRange(period);
      const transactions = await getAccountTransactionsConcurrently({
        entities,
        identity: signIdentity,
        range,
      });
      const datasets = buildTransactionsDatasets({
        transactions,
        i18n: $i18n,
        neuronAccounts,
        swapCanisterAccounts,
        principal: signIdentity.getPrincipal(),
      });
      const headers: CsvHeader<TransactionsCsvData>[] = [
        {
          id: "id",
          label: $i18n.reporting.transaction_id,
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
          id: "to",
          label: $i18n.reporting.to,
        },
        {
          id: "from",
          label: $i18n.reporting.from,
        },
        {
          id: "type",
          label: $i18n.reporting.transaction_type,
        },
        {
          id: "amount",
          label: replacePlaceholders($i18n.reporting.amount, {
            $tokenSymbol: ICPToken.symbol,
          }),
        },
        {
          id: "timestamp",
          label: $i18n.reporting.timestamp,
        },
      ];
      const fileName = `icp_transactions_export_${formatDateCompact(new Date())}`;

      await generateCsvFileToSave({
        datasets,
        headers,
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
          labelKey: "reporting.error_transactions",
        });
      }
    } finally {
      loading = false;
      stopBusy("reporting-transactions");
    }
  };
</script>

<button
  data-tid="reporting-transactions-button-component"
  on:click={exportIcpTransactions}
  class="primary with-icon"
  disabled={loading}
  aria-label={$i18n.reporting.transactions_download}
>
  <IconDown />
  {$i18n.reporting.transactions_download}
</button>

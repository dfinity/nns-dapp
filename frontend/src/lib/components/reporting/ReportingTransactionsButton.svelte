<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconDown, Spinner, stopBusy } from "@dfinity/gix-components";
  import { ICPToken, isNullish, nonNullish } from "@dfinity/utils";
  import {
    buildTransactionsDatasets,
    CsvGenerationError,
    FileSystemAccessError,
    generateCsvFileToSave,
    type CsvHeader,
    type TransactionsCsvData,
  } from "$lib/utils/export-to-csv.utils";
  import { toastsError } from "$lib/stores/toasts.store";
  import { formatDateCompact } from "$lib/utils/date.utils";
  import { authStore } from "$lib/stores/auth.store";
  import { getAccountTransactionsConcurrently } from "$lib/services/export-data.services";
  import { SignIdentity, type Identity } from "@dfinity/agent";
  import { createSwapCanisterAccountsStore } from "$lib/derived/sns-swap-canisters-accounts.derived";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import type { Account } from "$lib/types/account";
  import type { Readable } from "svelte/store";
  import type { NeuronInfo } from "@dfinity/nns";
  import { queryNeurons } from "$lib/api/governance.api";
  import { sortNeuronsByStake } from "$lib/utils/neuron.utils";
  import { nnsAccountsListStore } from "$lib/derived/accounts-list.derived";

  export let nnsNeurons: NeuronInfo[] = [];

  let isDisabled = true;
  let identity: Identity | null | undefined;
  let swapCanisterAccounts: Set<string>;
  let nnsAccounts: Account[];
  let swapCanisterAccountsStore: Readable<Set<string>>;
  let loading = false;

  $: identity = $authStore.identity;
  $: neuronAccounts = new Set(
    nnsNeurons
      .filter((neuron) => nonNullish(neuron.fullNeuron?.accountIdentifier))
      .map((neuron) => neuron.fullNeuron!.accountIdentifier)
  );
  $: nnsAccounts = $nnsAccountsListStore;
  $: isDisabled =
    isNullish(identity) ||
    (nnsAccounts.length === 0 && nnsNeurons.length === 0);
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
      const transactions = await getAccountTransactionsConcurrently({
        entities,
        identity: signIdentity,
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
          label: $i18n.export_csv_neurons.transaction_id,
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
          id: "to",
          label: $i18n.export_csv_neurons.to,
        },
        {
          id: "from",
          label: $i18n.export_csv_neurons.from,
        },
        {
          id: "type",
          label: $i18n.export_csv_neurons.transaction_type,
        },
        {
          id: "amount",
          label: replacePlaceholders($i18n.export_csv_neurons.amount, {
            $tokenSymbol: ICPToken.symbol,
          }),
        },
        {
          id: "timestamp",
          label: $i18n.export_csv_neurons.timestamp,
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

<div class="wrapper">
  <button
    data-tid="reporting-transactions-button-component"
    on:click={exportIcpTransactions}
    class="primary with-icon"
    disabled={isDisabled || loading}
    aria-label={$i18n.reporting.transactions_download}
  >
    <IconDown />
    {$i18n.reporting.transactions_download}
  </button>

  {#if loading}
    <div>
      <Spinner inline size="tiny" />
    </div>
  {/if}
</div>

<style lang="scss">
  .wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--padding-2x);
  }
</style>

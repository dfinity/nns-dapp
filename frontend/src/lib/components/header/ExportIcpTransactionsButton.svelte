<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconDown } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";
  import { ICPToken, isNullish } from "@dfinity/utils";
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
  import { nnsAccountsListStore } from "$lib/derived/accounts-list.derived";
  import { getAccountTransactionsConcurrently } from "$lib/services/export-data.services";
  import { SignIdentity, type Identity } from "@dfinity/agent";
  import { createSwapCanisterAccountsStore } from "$lib/derived/sns-swap-canisters-accounts.derived";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import type { Account } from "$lib/types/account";
  import { neuronAccountsStore } from "$lib/derived/neurons.derived";
  import type { Readable } from "svelte/store";
  import { neuronsStore } from "$lib/stores/neurons.store";
  import type { NeuronInfo } from "@dfinity/nns";

  const dispatcher = createEventDispatcher<{
    nnsExportIcpTransactionsCsvTriggered: void;
  }>();

  let isDisabled = true;
  let identity: Identity | null | undefined;
  let swapCanisterAccounts: Set<string>;
  let neuronAccounts: Set<string>;
  let nnsAccounts: Account[];
  let swapCanisterAccountsStore: Readable<Set<string>> | undefined;
  let nnsNeurons: NeuronInfo[] | undefined;

  $: identity = $authStore.identity;
  $: neuronAccounts = $neuronAccountsStore;
  $: nnsAccounts = $nnsAccountsListStore;
  $: nnsNeurons = $neuronsStore.neurons ?? [];
  $: isDisabled = isNullish(identity) || nnsAccounts.length === 0;
  $: swapCanisterAccountsStore = createSwapCanisterAccountsStore(
    identity?.getPrincipal()
  );
  $: swapCanisterAccounts = $swapCanisterAccountsStore ?? new Set();

  const exportIcpTransactions = async () => {
    try {
      // we are logged in to be able to interact with the button
      const signIdentity = identity as SignIdentity;
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
      dispatcher("nnsExportIcpTransactionsCsvTriggered");
    }
  };
</script>

<button
  data-tid="export-icp-transactions-button-component"
  on:click={exportIcpTransactions}
  class="text"
  disabled={isDisabled}
  aria-label={$i18n.header.export_neurons}
>
  <IconDown />
  {$i18n.header.export_transactions}
</button>

<style lang="scss">
  @use "../../themes/mixins/account-menu";

  button {
    @include account-menu.button;
    padding: 0;
  }
</style>

<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconDown } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";
  import {
    ICPToken,
    isNullish,
    nonNullish,
    TokenAmountV2,
  } from "@dfinity/utils";
  import {
    CsvGenerationError,
    FileSystemAccessError,
    generateCsvFileToSave,
  } from "$lib/utils/export-to-csv.utils";
  import { toastsError } from "$lib/stores/toasts.store";
  import {
    formatDateCompact,
    nanoSecondsToDateTime,
    nowInBigIntNanoSeconds,
  } from "$lib/utils/date.utils";
  import { authStore } from "$lib/stores/auth.store";
  import { nnsAccountsListStore } from "$lib/derived/accounts-list.derived";
  import {
    getAccountTransactionsConcurrently,
    type TransactionsAndAccounts,
  } from "$lib/services/export-data.services";
  import { SignIdentity } from "@dfinity/agent";
  import { mapIcpTransactionToReport } from "$lib/utils/icp-transactions.utils";
  import { neuronAccountsStore } from "$lib/derived/neurons.derived";
  import { createSwapCanisterAccountsStore } from "$lib/derived/sns-swap-canisters-accounts.derived";
  import { transactionName } from "$lib/utils/transactions.utils";
  import { formatTokenV2 } from "$lib/utils/token.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";

  const dispatcher = createEventDispatcher<{
    nnsExportIcpTransactionsCsvTriggered: void;
  }>();

  let isDisabled = true;
  $: identity = $authStore.identity;
  const swapCanisterAccountsStore = createSwapCanisterAccountsStore(
    identity?.getPrincipal()
  );
  $: swapCanisterAccounts = $swapCanisterAccountsStore ?? new Set();
  $: neuronAccounts = $neuronAccountsStore;
  $: nnsAccounts = Object.values($nnsAccountsListStore).flat();
  $: isDisabled = isNullish(identity) || nnsAccounts.length === 0;

  const buildDatasets = (
    data: TransactionsAndAccounts
  ): {
    data: {
      id: string;
      project: string;
      symbol: string;
      to: string | undefined;
      from: string | undefined;
      type: string;
      amount: string;
      timestamp: string;
    }[];
    metadata: {
      label: string;
      value: string;
    }[];
  }[] => {
    return data.map(({ account, transactions }) => {
      const amount = TokenAmountV2.fromUlps({
        amount: account.balanceUlps,
        token: ICPToken,
      });

      return {
        metadata: [
          {
            label: $i18n.export_csv_neurons.account_id,
            value: account.identifier,
          },
          {
            label: $i18n.export_csv_neurons.account_name,
            value: account.name ?? $i18n.accounts.main,
          },
          {
            label: replacePlaceholders($i18n.export_csv_neurons.balance, {
              $tokenSymbol: ICPToken.symbol,
            }),
            value: formatTokenV2({
              value: amount,
              detailed: true,
            }),
          },
          {
            label: $i18n.export_csv_neurons.controller_id,
            value:
              identity?.getPrincipal().toText() ?? $i18n.core.not_applicable,
          },
          {
            label: $i18n.export_csv_neurons.numer_of_transactions,
            value: transactions.length.toString(),
          },
          {
            label: $i18n.export_csv_neurons.date_label,
            value: nanoSecondsToDateTime(nowInBigIntNanoSeconds()),
          },
        ],
        data: transactions.map((transaction) => {
          const {
            to,
            from,
            type,
            tokenAmount,
            timestampNanos,
            transactionDirection,
          } = mapIcpTransactionToReport({
            accountIdentifier: account.identifier,
            transaction,
            neuronAccounts,
            swapCanisterAccounts,
          });

          const sign = transactionDirection === "credit" ? "+" : "-";
          const amount = formatTokenV2({ value: tokenAmount, detailed: true });
          const timestamp = nonNullish(timestampNanos)
            ? nanoSecondsToDateTime(timestampNanos)
            : $i18n.core.not_applicable;

          return {
            id: transaction.id.toString(),
            project: ICPToken.name,
            symbol: ICPToken.symbol,
            to,
            from,
            type: transactionName({ type, i18n: $i18n }),
            amount: `${sign}${amount}`,
            timestamp,
          };
        }),
      };
    });
  };

  const exportIcpTransactions = async () => {
    // Button will only be shown if logged in
    try {
      const data = await getAccountTransactionsConcurrently({
        accounts: nnsAccounts,
        identity: identity as SignIdentity,
      });
      const datasets = buildDatasets(data);
      const fileName = `icp_transactions_export_${formatDateCompact(new Date())}`;
      await generateCsvFileToSave({
        datasets,
        headers: [
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

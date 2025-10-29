<script lang="ts">
  import { queryNeurons } from "$lib/api/governance.api";
  import { nnsAccountsListStore } from "$lib/derived/accounts-list.derived";
  import { createSwapCanisterAccountsStore } from "$lib/derived/sns-swap-canisters-accounts.derived";
  import {
    getAccountTransactionsConcurrently,
    getAllIcrcTransactionsForCkTokens,
  } from "$lib/services/reporting.services";
  import { authStore } from "$lib/stores/auth.store";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsError } from "$lib/stores/toasts.store";
  import type { Account } from "$lib/types/account";
  import type {
    ReportingPeriod,
    ReportingTransactionsSource,
  } from "$lib/types/reporting";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { sortNeuronsByStake } from "$lib/utils/neuron.utils";
  import {
    CsvGenerationError,
    FileSystemAccessError,
  } from "$lib/utils/reporting.save-csv-to-file.utils";
  import {
    buildFileName,
    buildIcrcTransactionsDataset,
    buildTransactionsDatasets,
    convertPeriodToNanosecondRange,
    generateCsvFileToSave,
    type CsvHeader,
    type TransactionsCsvData,
  } from "$lib/utils/reporting.utils";
  import { SignIdentity, type Identity } from "@dfinity/agent";
  import { IconDown } from "@dfinity/gix-components";
  import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
  import type { NeuronInfo } from "@dfinity/nns";
  import { ICPToken, nonNullish } from "@dfinity/utils";

  type Props = {
    period: ReportingPeriod;
    customFrom?: string;
    customTo?: string;
    source: ReportingTransactionsSource;
  };

  let { period, customFrom, customTo, source }: Props = $props();

  const identity = $derived($authStore.identity);
  const nnsAccounts = $derived($nnsAccountsListStore);
  const swapCanisterAccountsStore = $derived(
    createSwapCanisterAccountsStore(identity?.getPrincipal())
  );
  const swapCanisterAccounts = $derived(
    $swapCanisterAccountsStore ?? new Set()
  );
  let loading = $state(false);

  const isCustomPeriodIncomplete = $derived(
    period === "custom" && (!customFrom || !customTo)
  );
  const isDisabled = $derived(loading || isCustomPeriodIncomplete);

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

  const exportCkTransactions = async () => {
    // user needs to be logged in to see this page
    const signIdentity = identity as SignIdentity;

    try {
      loading = true;
      startBusy({
        initiator: "reporting-transactions",
        labelKey: "reporting.busy_screen",
      });

      const range = convertPeriodToNanosecondRange({
        period,
        from: customFrom,
        to: customTo,
      });

      const mainAccount = {
        owner: signIdentity.getPrincipal(),
      };

      const ckTokens = await getAllIcrcTransactionsForCkTokens({
        account: mainAccount,
        identity: signIdentity,
        range,
      });

      const datasets: {
        metadata?: Array<{ label: string; value: string }>;
        data: TransactionsCsvData[];
      }[] = [];

      for (const ckToken of ckTokens) {
        const account: Account = {
          type: "main",
          principal: mainAccount.owner,
          balanceUlps: ckToken.balance,
          identifier: encodeIcrcAccount(mainAccount),
        };

        const data = buildIcrcTransactionsDataset({
          account,
          i18n: $i18n,
          token: ckToken.token,
          transactions: ckToken.transactions,
        });

        datasets.push(data);
      }

      const headers: CsvHeader<TransactionsCsvData>[] = [
        { id: "id", label: $i18n.reporting.transaction_index },
        { id: "symbol", label: $i18n.reporting.symbol },
        { id: "accountId", label: $i18n.reporting.account_id },
        { id: "to", label: $i18n.reporting.to },
        { id: "from", label: $i18n.reporting.from },
        { id: "type", label: $i18n.reporting.transaction_type },
        {
          id: "amount",
          label: replacePlaceholders($i18n.reporting.amount, {
            $tokenSymbol: "",
          }),
        },
        { id: "timestamp", label: $i18n.reporting.timestamp },
      ];

      const fileName = buildFileName({
        period,
        from: customFrom,
        to: customTo,
        type: "ck-tokens",
      });

      await generateCsvFileToSave<TransactionsCsvData>({
        datasets,
        headers,
        fileName,
      });
    } catch (error) {
      console.error("Error exporting ICRC transactions:", error);
      if (error instanceof FileSystemAccessError) {
        toastsError({ labelKey: "reporting.error_file_system_access" });
      } else if (error instanceof CsvGenerationError) {
        toastsError({ labelKey: "reporting.error_csv_generation" });
      } else {
        toastsError({ labelKey: "reporting.error_transactions" });
      }
    } finally {
      loading = false;
      stopBusy("reporting-transactions");
    }
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
      const range = convertPeriodToNanosecondRange({
        period,
        from: customFrom,
        to: customTo,
      });
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
          label: $i18n.reporting.transaction_index,
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
          id: "accountId",
          label: $i18n.reporting.account_id,
        },
        {
          id: "neuronId",
          label: $i18n.reporting.neuron_id,
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
      const fileName = buildFileName({
        period,
        from: customFrom,
        to: customTo,
      });

      await generateCsvFileToSave({
        datasets,
        headers,
        fileName,
      });
    } catch (error) {
      console.error("Error exporting transactions:", error);

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

  const exportTransactions = () =>
    source === "ck" ? exportCkTransactions() : exportIcpTransactions();
</script>

<button
  data-tid="reporting-transactions-button-component"
  onclick={exportTransactions}
  class="primary with-icon"
  disabled={isDisabled}
  aria-label={$i18n.reporting.transactions_download}
>
  <IconDown />
  {$i18n.reporting.transactions_download}
</button>

<script lang="ts">
  import { queryNeurons } from "$lib/api/governance.api";
  import { querySnsNeurons } from "$lib/api/sns-governance.api";
  import { nnsAccountsListStore } from "$lib/derived/accounts-list.derived";
  import { createSwapCanisterAccountsStore } from "$lib/derived/sns-swap-canisters-accounts.derived";
  import { snsProjectsActivePadStore } from "$lib/derived/sns/sns-projects.derived";
  import {
    getAccountTransactionsConcurrently,
    getAllIcrcTransactionsForCkTokens,
    getAllIcrcTransactionsFromAccountAndIdentity,
  } from "$lib/services/reporting.services";
  import { authStore } from "$lib/stores/auth.store";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsError, toastsShow } from "$lib/stores/toasts.store";
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
    mapPool,
    type CsvHeader,
    type TransactionsCsvData,
  } from "$lib/utils/reporting.utils";
  import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
  import { IconDown } from "@dfinity/gix-components";
  import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
  import type { NeuronInfo } from "@icp-sdk/canisters/nns";
  import {
    fromNullable,
    ICPToken,
    isNullish,
    nonNullish,
  } from "@dfinity/utils";
  import { SignIdentity, type Identity } from "@icp-sdk/core/agent";

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
  const snsProjects = $derived($snsProjectsActivePadStore);
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

      const ckTokensWithTransactions = ckTokens.filter(
        (ckToken) => ckToken.transactions.length > 0
      );

      if (ckTokensWithTransactions.length === 0) {
        toastsShow({
          labelKey: "reporting.transactions_no_results",
          level: "info",
        });
        return;
      }

      for (const ckToken of ckTokensWithTransactions) {
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

  const exportSnsTransactions = async () => {
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

      const results = await mapPool(
        snsProjects,
        async (project) => {
          const { transactions, balance } =
            await getAllIcrcTransactionsFromAccountAndIdentity({
              account: mainAccount,
              identity: signIdentity,
              indexCanisterId: project.summary.indexCanisterId,
              range,
            });

          return {
            token: project.summary.token,
            transactions,
            balance,
          };
        },
        5
      );

      const didEveryProjectFail = results.every((p) => p.status === "rejected");
      if (didEveryProjectFail) {
        toastsError({
          labelKey: "reporting.error_transactions",
        });
      }

      const didSomeProjectFail = results.some((p) => p.status === "rejected");
      if (didSomeProjectFail) {
        toastsError({
          labelKey: "reporting.error_some_sns_projects",
        });
      }

      const datasets: {
        metadata?: Array<{ label: string; value: string }>;
        data: TransactionsCsvData[];
      }[] = [];

      const fulfilled = results.filter((r) => r.status === "fulfilled");
      const withTransactions = fulfilled
        .map((r) => r.value)
        .filter((res) => res.transactions.length > 0);

      let anyTransactionsFound = false;

      for (const item of withTransactions) {
        const account: Account = {
          type: "main",
          principal: mainAccount.owner,
          balanceUlps: item.balance,
          identifier: encodeIcrcAccount(mainAccount),
        };

        const data = buildIcrcTransactionsDataset({
          account,
          i18n: $i18n,
          token: item.token,
          transactions: item.transactions,
        });

        const baseMap = new Map(
          (data.metadata ?? []).map(({ label, value }) => [label, value])
        );
        const balanceLabel = replacePlaceholders($i18n.reporting.balance, {
          $tokenSymbol: item.token.symbol,
        });
        data.metadata = [
          {
            label: $i18n.reporting.account_id,
            value:
              baseMap.get($i18n.reporting.account_id) ?? account.identifier,
          },
          { label: balanceLabel, value: baseMap.get(balanceLabel) ?? "" },
          {
            label: $i18n.reporting.controller_id,
            value:
              baseMap.get($i18n.reporting.controller_id) ??
              account.principal?.toText() ??
              $i18n.core.not_applicable,
          },
          {
            label: $i18n.reporting.number_of_transactions,
            value: item.transactions.length.toString(),
          },
          {
            label: $i18n.reporting.date_label,
            value: baseMap.get($i18n.reporting.date_label) ?? "",
          },
        ];

        datasets.push(data);
        anyTransactionsFound = true;
      }

      // Also include SNS neuron accounts per project
      const neuronsPerProject = await mapPool(
        snsProjects,
        async (project) => {
          const neurons = await querySnsNeurons({
            identity: signIdentity,
            rootCanisterId: project.rootCanisterId,
            certified: true,
          });

          // For each neuron, fetch its transactions from the project's index
          const neuronResults = await mapPool(
            neurons,
            async (neuron) => {
              const neuronSub = fromNullable(neuron.id)?.id;
              if (!neuronSub) {
                return { transactions: [], balance: 0n };
              }

              const neuronAccount = {
                owner: project.summary.governanceCanisterId,
                subaccount: neuronSub,
              } as const;

              const { transactions, balance } =
                await getAllIcrcTransactionsFromAccountAndIdentity({
                  account: neuronAccount,
                  identity: signIdentity,
                  indexCanisterId: project.summary.indexCanisterId,
                  range,
                });

              return {
                transactions,
                balance,
                identifier: encodeIcrcAccount(neuronAccount),
                token: project.summary.token,
                neuronIdHex: getSnsNeuronIdAsHexString(neuron),
              };
            },
            5
          );

          return neuronResults;
        },
        3
      );

      // Flatten and add datasets for neuron accounts with transactions
      for (const projectResult of neuronsPerProject) {
        if (projectResult.status !== "fulfilled") continue;

        for (const neuronResult of projectResult.value) {
          if (neuronResult.status !== "fulfilled") continue;

          const value = neuronResult.value;
          if (value.transactions.length === 0) continue;
          if (isNullish(value.identifier)) continue;
          if (isNullish(value.token)) continue;
          if (isNullish(value.neuronIdHex)) continue;

          const account: Account = {
            type: "main",
            principal: mainAccount.owner,
            balanceUlps: value.balance,
            identifier: value.identifier,
          };

          const data = buildIcrcTransactionsDataset({
            account,
            i18n: $i18n,
            token: value.token,
            transactions: value.transactions,
          });

          // Reorder and extend metadata to match NNS format (with neuron id)
          const baseMap = new Map(
            (data.metadata ?? []).map(({ label, value }) => [label, value])
          );
          const balanceLabel = replacePlaceholders($i18n.reporting.balance, {
            $tokenSymbol: value.token.symbol,
          });
          data.metadata = [
            {
              label: $i18n.reporting.account_id,
              value:
                baseMap.get($i18n.reporting.account_id) ?? account.identifier,
            },
            { label: $i18n.reporting.neuron_id, value: value.neuronIdHex },
            { label: balanceLabel, value: baseMap.get(balanceLabel) ?? "" },
            {
              label: $i18n.reporting.controller_id,
              value:
                baseMap.get($i18n.reporting.controller_id) ??
                account.principal?.toText() ??
                $i18n.core.not_applicable,
            },
            {
              label: $i18n.reporting.number_of_transactions,
              value: value.transactions.length.toString(),
            },
            {
              label: $i18n.reporting.date_label,
              value: baseMap.get($i18n.reporting.date_label) ?? "",
            },
          ];

          datasets.push(data);
          anyTransactionsFound = true;
        }
      }

      if (!anyTransactionsFound) {
        toastsShow({
          labelKey: "reporting.transactions_no_results",
          level: "info",
        });
        return;
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
        type: "sns-tokens",
      });

      await generateCsvFileToSave<TransactionsCsvData>({
        datasets,
        headers,
        fileName,
      });
    } catch (error) {
      console.error("Error exporting SNS ICRC transactions:", error);
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
    source === "ck"
      ? exportCkTransactions()
      : source === "sns"
        ? exportSnsTransactions()
        : exportIcpTransactions();
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

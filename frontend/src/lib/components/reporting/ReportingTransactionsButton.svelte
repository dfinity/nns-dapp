<script lang="ts">
  import { queryNeurons } from "$lib/api/governance.api";
  import { getTransactions as getIcrcIndexTransactions } from "$lib/api/icrc-index.api";
  import { CKBTC_INDEX_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
  import { nnsAccountsListStore } from "$lib/derived/accounts-list.derived";
  import { icrcCanistersStore } from "$lib/derived/icrc-canisters.derived";
  import { createSwapCanisterAccountsStore } from "$lib/derived/sns-swap-canisters-accounts.derived";
  import { getAccountTransactionsConcurrently } from "$lib/services/reporting.services";
  import { authStore } from "$lib/stores/auth.store";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsError } from "$lib/stores/toasts.store";
  import { tokensStore } from "$lib/stores/tokens.store";
  import type { Account } from "$lib/types/account";
  import type {
    ReportingPeriod,
    ReportingTransactionsSource,
  } from "$lib/types/reporting";
  import { nanoSecondsToDateTime } from "$lib/utils/date.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { mapIcrcTransaction } from "$lib/utils/icrc-transactions.utils";
  import { sortNeuronsByStake } from "$lib/utils/neuron.utils";
  import {
    CsvGenerationError,
    FileSystemAccessError,
  } from "$lib/utils/reporting.save-csv-to-file.utils";
  import {
    buildFileName,
    buildTransactionsDatasets,
    convertPeriodToNanosecondRange,
    generateCsvFileToSave,
    mapPool,
    type CsvHeader,
    type TransactionsCsvData,
  } from "$lib/utils/reporting.utils";
  import { formatTokenV2 } from "$lib/utils/token.utils";
  import { SignIdentity, type Identity } from "@dfinity/agent";
  import { IconDown } from "@dfinity/gix-components";
  import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
  import type { NeuronInfo } from "@dfinity/nns";
  import type { Principal } from "@dfinity/principal";
import { ICPToken, TokenAmountV2, nonNullish } from "@dfinity/utils";
import { queryIcrcBalance } from "$lib/api/icrc-ledger.api";

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
  // source provided by parent component

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

  const exportCkTransactions = async (
    tokens: { indexCanisterId: Principal; name: string }[]
  ) => {
    // we are logged in to be able to interact with the button
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
      const settled = await mapPool(tokens, (token) =>
        getIcrcIndexTransactions({
          identity: signIdentity,
          indexCanisterId: token.indexCanisterId,
          maxResults: 50n,
          // Note: ICRC index uses 'start' as tx id, not timestamp. We start from newest by omitting it.
          account: mainAccount,
        })
      );
      console.log(settled);
      debugger;

      // Collect datasets per ICRC account across all ckTokens
      const datasets: {
        metadata?: Array<{ label: string; value: string }>;
        data: TransactionsCsvData[];
      }[] = [];

      const canisters = $icrcCanistersStore;
      const tokensStoreData = $tokensStore;

      // Map each token result to a dataset (sequential to fetch balances)
      for (const res of settled) {
        if (res.status !== "fulfilled" || !res.value) continue;
        const { item, value } = res;

        // Find ledger id (universe) by matching index canister id
        const ledgerIdText = Object.entries(canisters).find(([, ids]) => {
          const idx = ids.indexCanisterId;
          return idx && idx.toText() === item.indexCanisterId.toText();
        })?.[0];

        const tokenMeta = ledgerIdText
          ? tokensStoreData[ledgerIdText]?.token
          : undefined;

        const encodedAccount = encodeIcrcAccount(mainAccount);
        const account: Account = {
          identifier: encodedAccount,
          balanceUlps: 0n,
          type: "main",
          principal: mainAccount.owner,
        } as unknown as Account;

        const rows: TransactionsCsvData[] = value.transactions.map((tx) => {
          const ui = mapIcrcTransaction({
            transaction: tx,
            account,
            toSelfTransaction: false,
            token: tokenMeta,
            i18n: $i18n,
          });

          const timestamp = nanoSecondsToDateTime(tx.transaction.timestamp);
          if (!ui) {
            return {
              id: tx.id.toString(),
              project: tokenMeta?.name ?? item.name ?? "",
              symbol: tokenMeta?.symbol ?? item.name ?? "",
              accountId: encodedAccount,
              to: undefined,
              from: undefined,
              type: "",
              amount: "",
              timestamp,
            };
          }

          const sign = ui.isIncoming ? "+" : "-";
          const amount = formatTokenV2({
            value: ui.tokenAmount,
            detailed: true,
          });

          return {
            id: tx.id.toString(),
            project: tokenMeta?.name ?? item.name ?? "",
            symbol: tokenMeta?.symbol ?? item.name ?? "",
            accountId: encodedAccount,
            to: ui.isIncoming ? account.identifier : ui.otherParty,
            from: ui.isIncoming ? ui.otherParty : account.identifier,
            type: ui.headline,
            amount: `${sign}${amount}`,
            timestamp,
          };
        });

        // Build metadata similar to ICP datasets
        const ledgerCanisterId = ledgerIdText
          ? canisters[ledgerIdText]?.ledgerCanisterId
          : undefined;
        let balanceUlps: bigint | undefined = undefined;
        if (ledgerCanisterId) {
          try {
            balanceUlps = await queryIcrcBalance({
              identity: signIdentity,
              certified: true,
              canisterId: ledgerCanisterId,
              account: mainAccount,
            });
          } catch {}
        }

        const tokenForFormat = tokenMeta ?? ICPToken;
        const formattedBalance = formatTokenV2({
          value: TokenAmountV2.fromUlps({
            amount: balanceUlps ?? 0n,
            token: tokenForFormat,
          }),
          detailed: true,
        });

        const metadata = [
          { label: $i18n.reporting.account_id, value: encodedAccount },
          {
            label: replacePlaceholders($i18n.reporting.balance, {
              $tokenSymbol: tokenMeta?.symbol ?? "",
            }),
            value: formattedBalance,
          },
          {
            label: $i18n.reporting.controller_id,
            value: signIdentity.getPrincipal().toText(),
          },
          {
            label: $i18n.reporting.number_of_transactions,
            value: String(rows.length),
          },
          {
            label: $i18n.reporting.date_label,
            value: nanoSecondsToDateTime(BigInt(Date.now()) * 1000000n),
          },
        ];

        datasets.push({ metadata, data: rows });
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

      const fileName = (() => {
        const date = new Date();
        return `icrc_transactions_export_${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}${period === "custom" ? `_${customFrom}_${customTo}` : `_${period}`}`;
      })();

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

  const ckTokens = $derived.by(() => {
    const btc = { name: "ckBTC", indexCanisterId: CKBTC_INDEX_CANISTER_ID };
    const ckTokens = Object.entries($tokensStore)
      .map(([k, v]) => {
        const index = $icrcCanistersStore[k];
        return {
          indexCanisterId: index?.indexCanisterId,
          name: v.token.name,
        };
      })
      .filter((t) => t.indexCanisterId !== undefined && t.name.startsWith("ck"))
      .filter((t) => t.name !== btc.name) as {
      indexCanisterId: Principal;
      name: string;
    }[];

    return [btc, ...ckTokens];
  });

  const exportTransactions = () =>
    source === "ck" ? exportCkTransactions(ckTokens) : exportIcpTransactions();

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

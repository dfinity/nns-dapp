<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconDown } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";
  import {
    formatMaturity,
    getStateInfo,
    neuronAvailableMaturity,
    neuronStake,
    neuronStakedMaturity,
  } from "$lib/utils/neuron.utils";
  import {
    ICPToken,
    isNullish,
    secondsToDuration,
    TokenAmountV2,
  } from "@dfinity/utils";
  import { formatTokenV2 } from "$lib/utils/token.utils";
  import { NeuronState, type NeuronInfo } from "@dfinity/nns";
  import {
    CsvGenerationError,
    FileSystemAccessError,
    generateCsvFileToSave,
  } from "$lib/utils/export-to-csv.utils";
  import { toastsError } from "$lib/stores/toasts.store";
  import {
    formatDateCompact,
    getFutureDateFromDelayInSeconds,
    nanoSecondsToDateTime,
    nowInBigIntNanoSeconds,
    secondsToDate,
  } from "$lib/utils/date.utils";
  import { authStore } from "$lib/stores/auth.store";
  import { nnsAccountsListStore } from "$lib/derived/accounts-list.derived";
  import {
    getAccountTransactionsConcurrently,
    type TransactionsAndAccounts,
  } from "$lib/services/export-data.services";
  import { SignIdentity } from "@dfinity/agent";
  import { mapToSelfTransactions } from "$lib/utils/icp-transactions.utils";
  import { neuronAccountsStore } from "$lib/derived/neurons.derived";
  import { createSwapCanisterAccountsStore } from "$lib/derived/sns-swap-canisters-accounts.derived";

  const dispatcher = createEventDispatcher<{
    nnsExportIcpTransactionsCsvTriggered: void;
  }>();

  let isDisabled = true;
  $: identity = $authStore.identity;
  $: isDisabled = isNullish(identity);
  $: neuronAccounts = $neuronAccountsStore;
  let swapCanisterAccountsStore;

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
      const selfTransactions = mapToSelfTransactions(transactions);

      swapCanisterAccountsStore = createSwapCanisterAccountsStore(
        identity?.getPrincipal()
      );
      return {
        metadata: [
          {
            label: "Account ID",
            value: account.identifier,
          },
          {
            label: "Name",
            value: account.name ?? "Main",
          },
          {
            label: "Ammount",
            value: account.balanceUlps.toString(),
          },
          {
            label: "Principal",
            value: account.principal?.toText(),
          },
          {
            label: "Transactions",
            value: transactions.length.toString(),
          },
          {
            label: "Export Date Time",
            value: nanoSecondsToDateTime(nowInBigIntNanoSeconds()),
          },
        ],
        data: selfTransactions.map(({ transaction, toSelfTransaction }) => {
          const tx = mapIcpTransaction({
            accountIdentifier: account.identifier,
            transaction,
            toSelfTransaction,
            neuronAccounts,
            swapCanisterAccounts: $swapCanisterAccountsStore ?? new Set(),
            i18n: $i18n,
          });
          return {
            id: transaction.id.toString(),
            project: ICPToken.name,
            symbol: ICPToken.symbol,
            to: tx?.otherParty,
            from: tx?.otherParty,
            type: "type",
            amount: tx?.tokenAmount,
            timestamp: tx?.timestamp,
          };
        }),
      };
    });
  };

  // const nnsNeuronToHumanReadableFormat = (neuron: NeuronInfo) => {
  //   const controllerId = neuron.fullNeuron?.controller?.toString();
  //   const neuronId = neuron.neuronId.toString();
  //   const neuronAccountId = neuron.fullNeuron?.accountIdentifier.toString();
  //   const stake = TokenAmountV2.fromUlps({
  //     amount: neuronStake(neuron),
  //     token: ICPToken,
  //   });
  //   const project = stake.token.name;
  //   const symbol = stake.token.symbol;
  //   const availableMaturity = neuronAvailableMaturity(neuron);
  //   const stakedMaturity = neuronStakedMaturity(neuron);
  //   const dissolveDelaySeconds = neuron.dissolveDelaySeconds;
  //   const dissolveDate =
  //     neuron.state === NeuronState.Dissolving
  //       ? getFutureDateFromDelayInSeconds(neuron.dissolveDelaySeconds)
  //       : null;
  //   const creationDate = secondsToDate(Number(neuron.createdTimestampSeconds));

  //   return {
  //     controllerId,
  //     project,
  //     symbol,
  //     neuronId,
  //     neuronAccountId,
  //     stake: formatTokenV2({
  //       value: stake,
  //       detailed: true,
  //     }),
  //     availableMaturity: formatMaturity(availableMaturity),
  //     stakedMaturity: formatMaturity(stakedMaturity),
  //     dissolveDelaySeconds: secondsToDuration({
  //       seconds: dissolveDelaySeconds,
  //       i18n: $i18n.time,
  //     }),
  //     dissolveDate: dissolveDate ?? $i18n.core.not_applicable,
  //     creationDate,
  //     state: $i18n.neuron_state[getStateInfo(neuron.state).textKey],
  //   };
  // };

  const exportIcpTransactions = async () => {
    // Button will only be shown if logged in
    if (!(identity instanceof SignIdentity)) return;
    try {
      const nnsAccounts = Object.values($nnsAccountsListStore).flat();

      const data = await getAccountTransactionsConcurrently({
        accounts: nnsAccounts,
        identity,
      });
      console.log(data);
      const datasets = buildDatasets(data);

      const fileName = `icp_transactions_export_${formatDateCompact(new Date())}`;
      await generateCsvFileToSave({
        datasets,
        headers: [
          {
            id: "id",
            label: $i18n.export_csv_neurons.stake,
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
            label: $i18n.export_csv_neurons.neuron_account_id,
          },
          {
            id: "from",
            label: $i18n.export_csv_neurons.controller_id,
          },
          {
            id: "type",
            label: $i18n.export_csv_neurons.available_maturity,
          },
          {
            id: "amount",
            label: $i18n.export_csv_neurons.staked_maturity,
          },
          {
            id: "timestamp",
            label: $i18n.export_csv_neurons.creation_date,
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
  data-tid="export-neurons-button-component"
  on:click={exportIcpTransactions}
  class="text"
  disabled={isDisabled}
  aria-label={$i18n.header.export_neurons}
>
  <IconDown />
  Export ICP Transactions
</button>

<style lang="scss">
  @use "../../themes/mixins/account-menu";

  button {
    @include account-menu.button;
    padding: 0;
  }
</style>

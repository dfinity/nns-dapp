<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconDown } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";
  import { neuronAccountsStore } from "$lib/stores/neurons.store";
  import { getTransactions } from "$lib/api/icp-index.api";
  import { universesAccountsStore } from "$lib/derived/universes-accounts.derived";
  import { getCurrentIdentity } from "$lib/services/auth.services";
  import { mapIcpTransaction } from "$lib/utils/icp-transactions.utils";
  import { createSwapCanisterAccountsStore } from "$lib/derived/sns-swap-canisters-accounts.derived";
  import { formatTokenV2 } from "$lib/utils/token.utils";

  // Component code
  const dispatcher = createEventDispatcher<{
    nnsExportTransactionsCSVTriggered: void;
  }>();

  async function fetchTransactionsServiceLayer({
    accountId,
    start,
  }: {
    accountId: string;
    start?: bigint;
  }) {
    try {
      const maxResults = 20;
      const identity = await getCurrentIdentity();
      // what if bigger than page? recursive call. this list could be quite big
      const { transactions } = await getTransactions({
        accountIdentifier: accountId,
        identity,
        maxResults: BigInt(maxResults),
        start,
      });
      // Handle transactions data here
      // check if there are pending transactions
      // const completed = transactions.some(({ id }) => id === oldestTxId);
      return transactions;
      // Handle the completed status appropriately
    } catch (error) {
      console.error("Error loading ICP account transactions:", error);
    }
  }

  const accounts = Object.values($universesAccountsStore).flat();

  const account = accounts[0];
  const accountIdentifier = account.identifier;
  const accountPrincipal = account.principal;
  const swapCanisterAccountsStore =
    createSwapCanisterAccountsStore(accountPrincipal);
  // End of component code

  const exportTransactions = async () => {
    try {
      // loadIcpAccountTransactions(accounts[0]);
      const transactions = await fetchTransactionsServiceLayer({
        accountId: accountIdentifier,
      });
      if (!transactions || transactions.length === 0) {
        console.log("No transactions found");
        return;
      }

      const data = transactions
        .map((transaction) => ({
          transaction,
          ...mapIcpTransaction({
            transaction,
            accountIdentifier,
            i18n: $i18n,
            neuronAccounts: $neuronAccountsStore,
            swapCanisterAccounts: $swapCanisterAccountsStore ?? new Set(),
            toSelfTransaction: false,
          }),
        }))
        .map((t) => ({
          Id: t.transaction.id,
          To: t.transaction.transaction.operation.Transfer.to,
          From: t.transaction.transaction.operation.Transfer.from,
          Type: t.headline,
          Amount: `${t.isIncoming ? "+" : "-"}${t.tokenAmount ? formatTokenV2({ value: t.tokenAmount, detailed: true }) : 0}`,
          Date: t.timestamp,
        }));

      downloadCSV(data, "transactions");
    } catch (error) {
      console.error("Error exporting transactions:", error);
      // Handle error appropriately, what can go wrong?
    } finally {
      dispatcher("nnsExportTransactionsCSVTriggered");
    }
  };
  // Move all to some export-neurons utils file or similar
  const convertToCSV = (data: Record<string, unknown>[]) => {
    // Get headers from the first object
    const headers = Object.keys(data[0]);
    // Create CSV header row
    const csvRows = [headers.join(",")];

    // Add data rows
    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header];
        // Handle special cases (like strings with commas)
        return typeof value === "string" && value.includes(",")
          ? `"${value}"`
          : value;
      });
      csvRows.push(values.join(","));
    }
    return csvRows.join("\n");
  };
  // Move all to some export-neurons utils file or similar
  const downloadCSV = async (
    data: Record<string, unknown>[],
    title: string
  ): Promise<void> => {
    const csvContent = convertToCSV(data);
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    // Use native file system API if available
    if (window.showSaveFilePicker) {
      const handle = await window.showSaveFilePicker({
        suggestedName: `${title}.csv`,
        types: [
          {
            description: "CSV File",
            accept: { "text/csv": [".csv"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
    } else {
      // Fallback for browsers without File System API
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "neurons.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };
</script>

<button
  data-tid="export-neurons-button"
  on:click={exportTransactions}
  class="text"
  aria-label={$i18n.header.export_transactions}
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

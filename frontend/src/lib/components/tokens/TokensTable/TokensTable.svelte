<script lang="ts">
  import TokenActionsCell from "$lib/components/tokens/TokensTable/TokenActionsCell.svelte";
  import TokenBalanceCell from "$lib/components/tokens/TokensTable/TokenBalanceCell.svelte";
  import TokenTitleCell from "$lib/components/tokens/TokensTable/TokenTitleCell.svelte";
  import ResponsiveTable from "$lib/components/ui/ResponsiveTable.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { importedTokensStore } from "$lib/stores/imported-tokens.store";
  import type {
    TokensTableColumn,
    TokensTableOrder,
    UserToken,
  } from "$lib/types/tokens-page";
  import {
    compareTokensByBalance,
    compareTokensByProject,
  } from "$lib/utils/tokens-table.utils";

  export let userTokensData: Array<UserToken>;
  export let firstColumnHeader: string;
  export let order: TokensTableOrder = [];
  export let displayTableSettings = false;
  export let testId: string = "tokens-table-component";
  export let subtitle: string | undefined = undefined;

  let enableSorting: boolean;
  $: enableSorting = order.length > 0;

  let importedTokenIds: Set<string> = new Set();
  $: importedTokenIds = new Set(
    ($importedTokensStore.importedTokens ?? []).map(({ ledgerCanisterId }) =>
      ledgerCanisterId.toText()
    )
  );

  let columns: TokensTableColumn[];

  $: columns = [
    {
      id: "title",
      title: firstColumnHeader,
      subtitle,
      cellComponent: TokenTitleCell,
      alignment: "left",
      templateColumns: ["1fr"],
      comparator: enableSorting ? compareTokensByProject : undefined,
    },
    {
      id: "balance",
      title: $i18n.tokens.balance_header,
      cellComponent: TokenBalanceCell,
      alignment: "right",
      templateColumns: ["max-content"],
      comparator: enableSorting
        ? compareTokensByBalance({ importedTokenIds })
        : undefined,
    },
    {
      title: "",
      cellComponent: TokenActionsCell,
      alignment: "right",
      templateColumns: ["max-content"],
    },
  ];
</script>

<ResponsiveTable
  {testId}
  tableData={userTokensData}
  {columns}
  bind:order
  {displayTableSettings}
  on:nnsAction
>
  <slot name="last-row" slot="last-row" />
  <slot name="settings-popover" slot="settings-popover" />
</ResponsiveTable>

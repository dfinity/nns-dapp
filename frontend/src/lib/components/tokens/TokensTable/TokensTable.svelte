<script lang="ts">
  import TokenActionsCell from "$lib/components/tokens/TokensTable/TokenActionsCell.svelte";
  import TokenBalanceCell from "$lib/components/tokens/TokensTable/TokenBalanceCell.svelte";
  import TokenTitleCell from "$lib/components/tokens/TokensTable/TokenTitleCell.svelte";
  import ResponsiveTable from "$lib/components/ui/ResponsiveTable.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { TokensTableColumn, UserToken } from "$lib/types/tokens-page";

  export let userTokensData: Array<UserToken>;
  export let firstColumnHeader: string;

  const columns: TokensTableColumn[] = [
    {
      title: firstColumnHeader,
      cellComponent: TokenTitleCell,
      alignment: "left",
      templateColumns: ["1fr"],
    },
    {
      title: $i18n.tokens.balance_header,
      cellComponent: TokenBalanceCell,
      alignment: "right",
      templateColumns: ["max-content"],
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
  testId="tokens-table-component"
  tableData={userTokensData}
  {columns}
  on:nnsAction
>
  <slot name="last-row" slot="last-row" />
  <slot name="header-icon" slot="header-icon" />
</ResponsiveTable>

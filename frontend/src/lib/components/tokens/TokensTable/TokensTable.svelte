<script lang="ts">
  import ResponsiveTable from "$lib/components/ui/ResponsiveTable.svelte";
  import TokenTitleCell from "./TokenTitleCell.svelte";
  import TokenBalanceCell from "./TokenBalanceCell.svelte";
  import TokenActionsCell from "./TokenActionsCell.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { UserToken, TokensTableColumn } from "$lib/types/tokens-page";

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

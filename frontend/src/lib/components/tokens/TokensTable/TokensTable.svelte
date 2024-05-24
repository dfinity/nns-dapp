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
      component: TokenTitleCell,
    },
    {
      title: $i18n.tokens.balance_header,
      component: TokenBalanceCell,
    },
    {
      title: "",
      component: TokenActionsCell,
    },
  ];
</script>

<ResponsiveTable {columns} tableData={userTokensData} on:nnsAction>
  <slot name="last-row" slot="last-row" />
  <slot name="header-icon" slot="header-icon" />
</ResponsiveTable>

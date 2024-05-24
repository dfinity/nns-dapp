<script lang="ts">
  import type { UserToken } from "$lib/types/tokens-page";
  import ResponsiveTable from "$lib/components/ui/ResponsiveTable.svelte";

  export let userTokensData: Array<UserToken>;
  export let firstColumnHeader: string;
</script>

<ResponsiveTable {userTokensData} {firstColumnHeader} on:nnsAction>
  <slot name="last-row" slot="last-row" />
  <slot name="header-icon" slot="header-icon" />
</ResponsiveTable>

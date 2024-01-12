<script lang="ts">
  import TokensTable from "$lib/components/tokens/TokensTable/TokensTable.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { UserToken } from "$lib/types/tokens-page";

  export let userTokensData: UserToken[];
</script>

<div data-tid="tokens-page-component">
  <TokensTable
    {userTokensData}
    on:nnsAction
    firstColumnHeader={$i18n.tokens.projects_header}
  />
</div>

<style lang="scss">
  div {
    // Add some margin at the bottom so that the table doesn't stick to the bottom of the screen.
    margin-bottom: var(--padding);
  }
</style>

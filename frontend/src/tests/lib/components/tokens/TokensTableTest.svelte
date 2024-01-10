<script lang="ts">
  import TokensTable from "$lib/components/tokens/TokensTable/TokensTable.svelte";
  import type { UserTokenData } from "$lib/types/tokens-page";
  import { nonNullish } from "@dfinity/utils";

  export let userTokensData: UserTokenData[] = [];
  export let lastRowText: string | undefined = undefined;
</script>

<TokensTable firstColumnHeader="Projects" {userTokensData}>
  <svelte:fragment slot="last-row">
    {#if nonNullish(lastRowText)}
      <div>{lastRowText}</div>
    {/if}
  </svelte:fragment>
</TokensTable>

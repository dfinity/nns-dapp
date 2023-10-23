<script lang="ts">
  import TokensTable from "$lib/components/tokens/TokensTable.svelte";
  import type { UserTokenData } from "$lib/types/tokens-page";

  export let tokens: UserTokenData[];
</script>

<div data-tid="tokens-page-component">
  <!-- TODO: GIX-1982 Render desktop or mobile component -->
  <TokensTable
    {tokens}
    on:nnsGoToDetail
    on:nnsRowClick
    on:nnsSend
    on:nnsReceive
  />
  <!-- TODO: GIX-1977 Mobile component -->
</div>

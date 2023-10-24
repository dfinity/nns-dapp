<script lang="ts">
  import MainWrapper from "$lib/components/tokens/MainWrapper.svelte";
  import TokensTable from "$lib/components/tokens/DesktopTokensTable/DesktopTokensTable.svelte";
  import type { UserTokenData } from "$lib/types/tokens-page";

  export let tokens: UserTokenData[];
</script>

<MainWrapper testId="tokens-page-component">
  <!-- TODO: GIX-1982 Render desktop or mobile component -->
  <TokensTable
    {tokens}
    on:nnsGoToDetail
    on:nnsRowClick
    on:nnsSend
    on:nnsReceive
  />
  <!-- TODO: GIX-1977 Mobile component -->
</MainWrapper>

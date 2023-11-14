<script lang="ts">
  import MainWrapper from "$lib/components/tokens/MainWrapper.svelte";
  import TokensTable from "$lib/components/tokens/TokensTable/TokensTable.svelte";
  import type { UserTokenData } from "$lib/types/tokens-page";

  export let userTokensData: UserTokenData[];
</script>

<MainWrapper testId="tokens-page-component">
  <TokensTable {userTokensData} on:nnsAction />
</MainWrapper>

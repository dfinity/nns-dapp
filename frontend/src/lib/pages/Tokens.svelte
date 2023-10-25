<script lang="ts">
  import MainWrapper from "$lib/components/tokens/MainWrapper.svelte";
  import DesktopTokensTable from "$lib/components/tokens/DesktopTokensTable/DesktopTokensTable.svelte";
  import type { UserTokenData } from "$lib/types/tokens-page";

  export let userTokensData: UserTokenData[];
</script>

<MainWrapper testId="tokens-page-component">
  <!-- TODO: GIX-1982 Render desktop or mobile component -->
  <DesktopTokensTable {userTokensData} on:nnsAction />
  <!-- TODO: GIX-1977 Mobile component -->
</MainWrapper>

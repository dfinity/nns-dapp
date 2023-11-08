<script lang="ts">
  import MainWrapper from "$lib/components/tokens/MainWrapper.svelte";
  import DesktopTokensTable from "$lib/components/tokens/DesktopTokensTable/DesktopTokensTable.svelte";
  import MobileTokensList from "$lib/components/tokens/MobileTokensList/MobileTokensList.svelte";
  import type { UserTokenData } from "$lib/types/tokens-page";

  export let userTokensData: UserTokenData[];

  let innerWidth = 0;

  let isMobileWidth = false;
  // TODO: Use constant from gix-components
  const BREAKPOINT_MEDIUM = 768;
  $: isMobileWidth = innerWidth < BREAKPOINT_MEDIUM;
</script>

<svelte:window bind:innerWidth />

<MainWrapper testId="tokens-page-component">
  {#if isMobileWidth}
    <MobileTokensList {userTokensData} on:nnsAction />
  {:else}
    <DesktopTokensTable {userTokensData} on:nnsAction />
  {/if}
  <!-- TODO: GIX-1977 Mobile component -->
</MainWrapper>

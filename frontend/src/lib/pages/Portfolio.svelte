<script lang="ts">
  import Card from "$lib/components/portfolio/Card.svelte";
  import LoginCard from "$lib/components/portfolio/LoginCard.svelte";
  import NoNeuronsCard from "$lib/components/portfolio/NoNeuronsCard.svelte";
  import NoTokensCard from "$lib/components/portfolio/NoTokensCard.svelte";
  import TotalAssetsCard from "$lib/components/portfolio/TotalAssetsCard.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { icpSwapUsdPricesStore } from "$lib/derived/icp-swap.derived";
  import { selectableUniversesStore } from "$lib/derived/selectable-universes.derived";
  import { tokensListUserStore } from "$lib/derived/tokens-list-user.derived";
  import { neuronsStore } from "$lib/stores/neurons.store";
  import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
  import type { TableProject } from "$lib/types/staking";
  import type { UserToken } from "$lib/types/tokens-page";
  import {
    getTableProjects,
    getTotalStakeInUsd,
  } from "$lib/utils/staking.utils";
  import { getTotalBalanceInUsd } from "$lib/utils/token.utils";
  import { TokenAmountV2, isNullish } from "@dfinity/utils";

  let userTokensData: UserToken[];
  $: userTokensData = $tokensListUserStore;

  let totalTokenBalanceInUsd: number;
  $: totalTokenBalanceInUsd = getTotalBalanceInUsd(userTokensData);

  let hasUnpricedTokens: boolean;
  $: hasUnpricedTokens = userTokensData.some(
    (token) =>
      token.balance instanceof TokenAmountV2 &&
      token.balance.toUlps() > 0n &&
      (!("balanceInUsd" in token) || isNullish(token.balanceInUsd))
  );

  let tableProjects: TableProject[];
  $: tableProjects = getTableProjects({
    universes: $selectableUniversesStore,
    isSignedIn: $authSignedInStore,
    nnsNeurons: $neuronsStore?.neurons,
    snsNeurons: $snsNeuronsStore,
    icpSwapUsdPrices: $icpSwapUsdPricesStore,
  });

  let totalStakedInUsd: number | undefined;
  $: totalStakedInUsd = getTotalStakeInUsd(tableProjects);

  let usdAmount: number;
  $: usdAmount = totalTokenBalanceInUsd + totalStakedInUsd;

  let isNotSignedIn: boolean;
  $: isNotSignedIn = !$authSignedInStore;

  let showNoTokensCard: boolean;
  $: showNoTokensCard = isNotSignedIn || totalTokenBalanceInUsd === 0;

  let showNoNeuronsCard: boolean;
  $: showNoNeuronsCard = isNotSignedIn || totalStakedInUsd === 0;
</script>

<main data-tid="portfolio-page-component">
  <div class="top" class:single-card={$authSignedInStore}>
    {#if isNotSignedIn}
      <LoginCard />
    {/if}
    <TotalAssetsCard {usdAmount} {hasUnpricedTokens} />
  </div>
  <div class="content">
    {#if showNoTokensCard}
      <NoTokensCard />
    {:else}
      <Card>tokens</Card>
    {/if}
    {#if showNoNeuronsCard}
      <NoNeuronsCard />
    {:else}
      <Card>has staked</Card>
    {/if}
  </div>
</main>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  main {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
    padding: var(--padding-2x);

    @include media.min-width(large) {
      display: grid;
      grid-template-rows: auto 1fr;
      gap: var(--padding-3x);
      padding: var(--padding-3x);
    }

    .top {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--padding-2x);

      @include media.min-width(large) {
        grid-template-columns: 1fr 2fr;

        > :global(article:first-of-type) {
          order: 1;
        }

        &.single-card {
          grid-template-columns: 1fr;
        }
      }
    }

    .content {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--padding-2x);

      @include media.min-width(large) {
        grid-template-columns: repeat(2, 1fr);
        grid-auto-rows: min-content;
        align-items: stretch;
      }
    }
  }
</style>

<script lang="ts">
  import LoginCard from "$lib/components/portfolio/LoginCard.svelte";
  import NoNeuronsCard from "$lib/components/portfolio/NoNeuronsCard.svelte";
  import NoTokensCard from "$lib/components/portfolio/NoTokensCard.svelte";
  import TokensCard from "$lib/components/portfolio/TokensCard.svelte";
  import TotalAssetsCard from "$lib/components/portfolio/TotalAssetsCard.svelte";
  import UsdValueBanner from "$lib/components/ui/UsdValueBanner.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import type { TableProject } from "$lib/types/staking";
  import type { UserToken, UserTokenData } from "$lib/types/tokens-page";
  import { getTopTokens } from "$lib/utils/portfolio.utils";
  import { getTotalStakeInUsd } from "$lib/utils/staking.utils";
  import { getTotalBalanceInUsd } from "$lib/utils/token.utils";
  import { TokenAmountV2, isNullish } from "@dfinity/utils";

  export let userTokens: UserToken[];
  export let tableProjects: TableProject[];

  let totalTokensBalanceInUsd: number;
  $: totalTokensBalanceInUsd = getTotalBalanceInUsd(userTokens);

  let hasUnpricedTokens: boolean;
  $: hasUnpricedTokens = userTokens.some(
    (token) =>
      token.balance instanceof TokenAmountV2 &&
      token.balance.toUlps() > 0n &&
      (!("balanceInUsd" in token) || isNullish(token.balanceInUsd))
  );
  let totalStakedInUsd: number;
  $: totalStakedInUsd = getTotalStakeInUsd(tableProjects);

  let hasUnpricedStake: boolean;
  $: hasUnpricedStake = tableProjects.some(
    (project) =>
      project.stake instanceof TokenAmountV2 &&
      project.stake.toUlps() > 0n &&
      (!("stakeInUsd" in project) || isNullish(project.stakeInUsd))
  );

  let hasUnpricedTokensOrStake: boolean;
  $: hasUnpricedTokensOrStake = hasUnpricedTokens || hasUnpricedStake;

  let totalUsdAmount: number | undefined;
  $: totalUsdAmount = $authSignedInStore
    ? totalTokensBalanceInUsd + totalStakedInUsd
    : undefined;

  let showNoTokensCard: boolean;
  $: showNoTokensCard = $authSignedInStore && totalTokensBalanceInUsd === 0;

  let showNoNeuronsCard: boolean;
  $: showNoNeuronsCard = !$authSignedInStore || totalStakedInUsd === 0;

  // The Card should display a Primary Action when it is the only available option.
  // This occurs when there are tokens but no stake.
  let hasNoNeuronsCardAPrimaryAction: boolean;
  $: hasNoNeuronsCardAPrimaryAction = !showNoTokensCard;

  let topTokens: UserTokenData[];
  $: topTokens = getTopTokens({
    userTokens,
    isSignedIn: $authSignedInStore,
  });
</script>

<main data-tid="portfolio-page-component">
  <div class="top" class:single-card={$authSignedInStore}>
    {#if !$authSignedInStore}
      <LoginCard />
    {/if}
    <UsdValueBanner
      usdAmount={totalUsdAmount}
      hasUnpricedTokens={hasUnpricedTokensOrStake}
    />
    <TotalAssetsCard
      usdAmount={totalUsdAmount}
      hasUnpricedTokens={hasUnpricedTokensOrStake}
    />
  </div>
  <div class="content">
    {#if showNoTokensCard}
      <NoTokensCard />
    {:else}
      <TokensCard {topTokens} usdAmount={totalTokensBalanceInUsd} />
    {/if}
    {#if showNoNeuronsCard}
      <NoNeuronsCard primaryCard={hasNoNeuronsCardAPrimaryAction} />
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
        grid-auto-rows: minmax(345px, min-content);
      }
    }
  }
</style>

<script lang="ts">
  import HeldTokensCard from "$lib/components/portfolio/HeldTokensCard.svelte";
  import LoginCard from "$lib/components/portfolio/LoginCard.svelte";
  import NoHeldTokensCard from "$lib/components/portfolio/NoHeldTokensCard.svelte";
  import NoStakedTokensCard from "$lib/components/portfolio/NoStakedTokensCard.svelte";
  import SkeletonTokensCard from "$lib/components/portfolio/SkeletonTokensCard.svelte";
  import StakedTokensCard from "$lib/components/portfolio/StakedTokensCard.svelte";
  import TotalAssetsCard from "$lib/components/portfolio/TotalAssetsCard.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import type { TableProject } from "$lib/types/staking";
  import type { UserToken, UserTokenData } from "$lib/types/tokens-page";
  import {
    getTopHeldTokens,
    getTopStakedTokens,
  } from "$lib/utils/portfolio.utils";
  import { getTotalStakeInUsd } from "$lib/utils/staking.utils";
  import { getTotalBalanceInUsd } from "$lib/utils/token.utils";
  import { TokenAmountV2, isNullish } from "@dfinity/utils";

  export let userTokens: UserToken[] = [];
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

  let areHeldTokensLoading: boolean;
  $: areHeldTokensLoading = userTokens.some(
    (token) => token.balance === "loading"
  );

  // Determines the display state of the held tokens card
  // - 'full': Shows card with data (or when user is not signed in, visitor data)
  // - 'loading': Shows skeleton while data is being fetched
  // - 'empty': Shows empty state when user has no tokens
  type TokensCardType = "empty" | "skeleton" | "full";

  let heldTokensCard: TokensCardType;
  $: heldTokensCard = !$authSignedInStore
    ? "full"
    : areHeldTokensLoading
      ? "skeleton"
      : totalTokensBalanceInUsd === 0
        ? "empty"
        : "full";

  let areStakedTokensLoading: boolean;
  $: areStakedTokensLoading = tableProjects.some(
    (project) => project.isStakeLoading
  );

  // Determines the display state of the staked tokens card
  // Similar logic to heldTokensCard but for staked tokens
  let stakedTokensCard: TokensCardType;
  $: stakedTokensCard = !$authSignedInStore
    ? "full"
    : areStakedTokensLoading
      ? "skeleton"
      : totalStakedInUsd === 0
        ? "empty"
        : "full";

  // Controls whether the staked tokens card should show a primary action
  // Primary action is shown when there are tokens but no stakes
  // This helps guide users to stake their tokens when possible
  let hasNoStakedTokensCardAPrimaryAction: boolean;
  $: hasNoStakedTokensCardAPrimaryAction =
    stakedTokensCard === "empty" && heldTokensCard === "full";

  // Global loading state that tracks if either held or staked tokens are loading
  // TotalAssetsCard will show this if either held or staked are loading
  let isSomethingLoading: boolean;
  $: isSomethingLoading = areHeldTokensLoading || areStakedTokensLoading;

  let topHeldTokens: UserTokenData[];
  $: topHeldTokens = getTopHeldTokens({
    userTokens: userTokens,
    isSignedIn: $authSignedInStore,
  });

  let topStakedTokens: TableProject[];
  $: topStakedTokens = getTopStakedTokens({
    projects: tableProjects,
    isSignedIn: $authSignedInStore,
  });
</script>

<main data-tid="portfolio-page-component">
  <div class="top" class:single-card={$authSignedInStore}>
    {#if !$authSignedInStore}
      <LoginCard />
    {/if}
    <TotalAssetsCard
      usdAmount={totalUsdAmount}
      hasUnpricedTokens={hasUnpricedTokensOrStake}
      isLoading={isSomethingLoading}
    />
  </div>
  <div class="content">
    {#if heldTokensCard === "skeleton"}
      <SkeletonTokensCard testId="held-tokens-skeleton-card" />
    {:else if heldTokensCard === "empty"}
      <NoHeldTokensCard />
    {:else}
      <HeldTokensCard
        {topHeldTokens}
        usdAmount={totalTokensBalanceInUsd}
        numberOfTopStakedTokens={topStakedTokens.length}
      />
    {/if}

    {#if stakedTokensCard === "skeleton"}
      <SkeletonTokensCard testId="staked-tokens-skeleton-card" />
    {:else if stakedTokensCard === "empty"}
      <NoStakedTokensCard primaryCard={hasNoStakedTokensCardAPrimaryAction} />
    {:else}
      <StakedTokensCard
        {topStakedTokens}
        usdAmount={totalStakedInUsd}
        numberOfTopHeldTokens={topHeldTokens.length}
      />
    {/if}
  </div>
</main>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  main {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);

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

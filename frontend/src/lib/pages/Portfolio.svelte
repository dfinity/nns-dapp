<script lang="ts">
  import ApyCard from "$lib/components/portfolio/ApyCard.svelte";
  import ApyFallbackCard from "$lib/components/portfolio/ApyFallbackCard.svelte";
  import HeldTokensCard from "$lib/components/portfolio/HeldTokensCard.svelte";
  import LoginCard from "$lib/components/portfolio/LoginCard.svelte";
  import NoHeldTokensCard from "$lib/components/portfolio/NoHeldTokensCard.svelte";
  import NoStakedTokensCard from "$lib/components/portfolio/NoStakedTokensCard.svelte";
  import SkeletonTokensCard from "$lib/components/portfolio/SkeletonTokensCard.svelte";
  import StakedTokensCard from "$lib/components/portfolio/StakedTokensCard.svelte";
  import StartStakingCard from "$lib/components/portfolio/StartStakingCard.svelte";
  import TotalAssetsCard from "$lib/components/portfolio/TotalAssetsCard.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { isDesktopViewportStore } from "$lib/derived/viewport.derived";
  import { ENABLE_APY_PORTFOLIO } from "$lib/stores/feature-flags.store";
  import type { TableProject } from "$lib/types/staking";
  import type { UserToken } from "$lib/types/tokens-page";
  import {
    getTopHeldTokens,
    getTopStakedTokens,
  } from "$lib/utils/portfolio.utils";
  import {
    isStakingRewardDataError,
    isStakingRewardDataLoading,
    isStakingRewardDataReady,
    type StakingRewardResult,
  } from "$lib/utils/staking-rewards.utils";
  import { getTotalStakeInUsd } from "$lib/utils/staking.utils";
  import { getTotalBalanceInUsd } from "$lib/utils/token.utils";
  import { TokenAmountV2, isNullish, nonNullish } from "@dfinity/utils";

  type Props = {
    userTokens: UserToken[];
    tableProjects: TableProject[];
    stakingRewardResult?: StakingRewardResult;
  };

  const {
    userTokens = [],
    tableProjects,
    stakingRewardResult,
  }: Props = $props();
  const totalTokensBalanceInUsd = $derived(getTotalBalanceInUsd(userTokens));
  const hasUnpricedTokens = $derived(
    userTokens.some(
      (token) =>
        token.balance instanceof TokenAmountV2 &&
        token.balance.toUlps() > 0n &&
        (!("balanceInUsd" in token) || isNullish(token.balanceInUsd))
    )
  );

  const totalStakedInUsd = $derived(getTotalStakeInUsd(tableProjects));
  const hasUpricedStake = $derived(
    tableProjects.some(
      (project) =>
        project.stake instanceof TokenAmountV2 &&
        project.stake.toUlps() > 0n &&
        (!("stakeInUsd" in project) || isNullish(project.stakeInUsd))
    )
  );

  const hasUnpricedTokensOrStake = $derived(
    hasUnpricedTokens || hasUpricedStake
  );

  const totalUsdAmount = $derived(
    $authSignedInStore ? totalTokensBalanceInUsd + totalStakedInUsd : undefined
  );

  // Determines the display state of the held tokens card
  // - 'full': Shows card with data (or when user is not signed in, visitor data)
  // - 'loading': Shows skeleton while data is being fetched
  // - 'empty': Shows empty state when user has no tokens
  type TokensCardType = "empty" | "skeleton" | "full";

  const areHeldTokensLoading = $derived(
    userTokens.some((token) => token.balance === "loading")
  );
  const heldTokensCard: TokensCardType = $derived(
    !$authSignedInStore
      ? "empty"
      : areHeldTokensLoading
        ? "skeleton"
        : totalTokensBalanceInUsd === 0
          ? "empty"
          : "full"
  );

  const areStakedTokensLoading = $derived(
    tableProjects.some((project) => project.isStakeLoading)
  );
  const stakedTokensCard: TokensCardType = $derived(
    !$authSignedInStore
      ? "empty"
      : areStakedTokensLoading
        ? "skeleton"
        : totalStakedInUsd === 0
          ? "empty"
          : "full"
  );

  // Global loading state that tracks if either held or staked tokens are loading
  // TotalAssetsCard will show this if either held or staked are loading
  const isSomethingLoading = $derived(
    areHeldTokensLoading || areStakedTokensLoading
  );

  const topHeldTokens = $derived(
    getTopHeldTokens({
      userTokens: userTokens,
    })
  );

  const topStakedTokens = $derived(
    getTopStakedTokens({
      projects: tableProjects,
    })
  );
</script>

<main data-tid="portfolio-page-component">
  <div class="top" class:apy-card={$ENABLE_APY_PORTFOLIO}>
    {#if !$authSignedInStore}
      <LoginCard />
      <StartStakingCard />
    {:else}
      <TotalAssetsCard
        usdAmount={totalUsdAmount}
        hasUnpricedTokens={hasUnpricedTokensOrStake}
        isLoading={isSomethingLoading}
        isFullWidth={!$ENABLE_APY_PORTFOLIO}
      />

      {#if $ENABLE_APY_PORTFOLIO && $isDesktopViewportStore && nonNullish(totalUsdAmount)}
        {#if isStakingRewardDataReady(stakingRewardResult)}
          <ApyCard
            icpOnlyMaturityBalance={stakingRewardResult.icpOnly.maturityBalance}
            icpOnlyMaturityEstimateWeek={stakingRewardResult.icpOnly
              .maturityEstimateWeek}
            icpOnlyStakingPower={stakingRewardResult.icpOnly.stakingPower}
          />
        {:else}
          <ApyFallbackCard stakingRewardData={stakingRewardResult} />
        {/if}
      {/if}
    {/if}

    {#if $ENABLE_APY_PORTFOLIO && !$isDesktopViewportStore && $authSignedInStore && nonNullish(totalUsdAmount) && nonNullish(stakingRewardResult)}
      {#if isStakingRewardDataReady(stakingRewardResult)}
        <ApyCard
          icpOnlyMaturityBalance={stakingRewardResult.icpOnly.maturityBalance}
          icpOnlyMaturityEstimateWeek={stakingRewardResult.icpOnly
            .maturityEstimateWeek}
          icpOnlyStakingPower={stakingRewardResult.icpOnly.stakingPower}
        />
      {:else}
        <ApyFallbackCard stakingRewardData={stakingRewardResult} />
      {/if}
    {/if}
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
      <NoStakedTokensCard />
    {:else}
      <StakedTokensCard
        {topStakedTokens}
        usdAmount={totalStakedInUsd}
        numberOfTopHeldTokens={topHeldTokens.length}
        hasApyCalculationErrored={isStakingRewardDataError(stakingRewardResult)}
        isApyLoading={isStakingRewardDataLoading(stakingRewardResult)}
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

    @include media.min-width(medium) {
      padding: var(--padding-2x);
    }

    @include media.min-width(large) {
      display: grid;
      grid-template-rows: auto auto auto 1fr;
      gap: var(--padding-3x);
      padding: var(--padding-3x);
    }

    .top {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--padding-2x);

      @include media.min-width(large) {
        grid-template-columns: 2fr 1fr;
      }
    }

    .content {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--padding-2x);

      @include media.min-width(large) {
        grid-template-columns: repeat(2, 1fr);
        grid-auto-rows: minmax(280px, min-content);
      }
    }
  }
</style>

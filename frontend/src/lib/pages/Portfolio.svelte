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
  import { isUserTokenData } from "$lib/utils/user-token.utils";
  import { TokenAmountV2, isNullish, nonNullish } from "@dfinity/utils";

  type Props = {
    icpToken: UserToken | undefined;
    nonIcpTokens: UserToken[];
    icpTableProject: TableProject | undefined;
    nonIcpTableProjects: TableProject[];
    stakingRewardResult?: StakingRewardResult;
  };

  // {icpTableProject}
  // {nonIcpTableProjects}
  const {
    icpToken,
    nonIcpTokens = [],
    icpTableProject,
    nonIcpTableProjects,
    stakingRewardResult,
  }: Props = $props();
  const icpBalanceInUsd = $derived(
    nonNullish(icpToken) ? getTotalBalanceInUsd([icpToken]) : 0
  );
  const nonIcpTokensBalanceInUsd = $derived(getTotalBalanceInUsd(nonIcpTokens));
  const hasUnpricedNonIcpTokens = $derived(
    nonIcpTokens.some(
      (token) =>
        token.balance instanceof TokenAmountV2 &&
        token.balance.toUlps() > 0n &&
        (!("balanceInUsd" in token) || isNullish(token.balanceInUsd))
    )
  );

  const icpStakedInUsd = $derived(
    nonNullish(icpTableProject) ? getTotalStakeInUsd([icpTableProject]) : 0
  );
  const nonIcpStakedInUsd = $derived(getTotalStakeInUsd(nonIcpTableProjects));
  const hasUnpricedNonIcpStake = $derived(
    nonIcpTableProjects.some(
      (project) =>
        project.stake instanceof TokenAmountV2 &&
        project.stake.toUlps() > 0n &&
        (!("stakeInUsd" in project) || isNullish(project.stakeInUsd))
    )
  );

  const hasUnpricedTokensOrStake = $derived(
    hasUnpricedNonIcpTokens || hasUnpricedNonIcpStake
  );

  const totalAssetsUsdAmount = $derived(
    $authSignedInStore
      ? icpBalanceInUsd +
          icpStakedInUsd +
          nonIcpTokensBalanceInUsd +
          nonIcpStakedInUsd
      : undefined
  );

  // Determines the display state of the held tokens card
  // - 'full': Shows card with data (or when user is not signed in, visitor data)
  // - 'loading': Shows skeleton while data is being fetched
  // - 'empty': Shows empty state when user has no tokens
  type TokensCardType = "empty" | "skeleton" | "full";

  const areHeldTokensLoading = $derived(
    nonIcpTokens.some((token) => token.balance === "loading")
  );
  const heldNonIcpTokensCard: TokensCardType = $derived(
    !$authSignedInStore
      ? "empty"
      : areHeldTokensLoading
        ? "skeleton"
        : nonIcpTokensBalanceInUsd === 0
          ? "empty"
          : "full"
  );

  const areStakedTokensLoading = $derived(
    nonIcpTableProjects.some((project) => project.isStakeLoading)
  );
  const stakedTokensCard: TokensCardType = $derived(
    !$authSignedInStore
      ? "empty"
      : areStakedTokensLoading
        ? "skeleton"
        : nonIcpStakedInUsd === 0
          ? "empty"
          : "full"
  );

  // Global loading state that tracks if either held or staked tokens are loading
  // TotalAssetsCard will show this if either held or staked are loading
  const isSomethingLoading = $derived(
    areHeldTokensLoading || areStakedTokensLoading
  );

  const icpHeldToken = $derived(
    nonNullish(icpToken) && isUserTokenData(icpToken) ? icpToken : undefined
  );
  const topHeldNonIcpTokens = $derived(
    getTopHeldTokens({
      userTokens: nonIcpTokens,
    })
  );

  const topStakedNonIcpTokens = $derived(
    getTopStakedTokens({
      projects: nonIcpTableProjects,
    })
  );

  const hasNonIcpBalance = $derived(
    nonIcpTokensBalanceInUsd + nonIcpStakedInUsd > 0
  );
</script>

<main data-tid="portfolio-page-component">
  <div class="top" class:apy-card={$ENABLE_APY_PORTFOLIO}>
    {#if !$authSignedInStore}
      <LoginCard />
      <StartStakingCard />
    {:else}
      <TotalAssetsCard
        usdAmount={totalAssetsUsdAmount}
        hasUnpricedTokens={hasUnpricedTokensOrStake}
        isLoading={isSomethingLoading}
        isFullWidth={!$ENABLE_APY_PORTFOLIO}
      />

      {#if $ENABLE_APY_PORTFOLIO && $isDesktopViewportStore && nonNullish(totalAssetsUsdAmount)}
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

    {#if $ENABLE_APY_PORTFOLIO && !$isDesktopViewportStore && $authSignedInStore && nonNullish(totalAssetsUsdAmount) && nonNullish(stakingRewardResult)}
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
    <!-- ICP TOKEN -->
    {#if !$authSignedInStore}
      <NoHeldTokensCard />
    {:else if isNullish(icpHeldToken)}
      <SkeletonTokensCard testId="held-icp-skeleton-card" icpOnlyTable />
    {:else}
      <HeldTokensCard
        topHeldTokens={[icpHeldToken]}
        usdAmount={icpBalanceInUsd}
        numberOfTopStakedTokens={1}
        icpOnlyTable
      />
    {/if}

    <!-- ICP NEURONS -->
    {#if !$authSignedInStore || isNullish(icpTableProject)}
      <NoStakedTokensCard />
    {:else if icpTableProject?.isStakeLoading}
      <SkeletonTokensCard testId="staked-icp-skeleton-card" icpOnlyTable />
    {:else}
      <StakedTokensCard
        topStakedTokens={[icpTableProject]}
        usdAmount={icpStakedInUsd}
        numberOfTopHeldTokens={1}
        hasApyCalculationErrored={isStakingRewardDataError(stakingRewardResult)}
        isApyLoading={isStakingRewardDataLoading(stakingRewardResult)}
        icpOnlyTable
      />
    {/if}

    {#if hasNonIcpBalance}
      <!-- REST TOKENS -->
      {#if heldNonIcpTokensCard === "skeleton"}
        <SkeletonTokensCard testId="held-tokens-skeleton-card" />
      {:else if heldNonIcpTokensCard === "empty"}
        {#if $authSignedInStore}
          <NoHeldTokensCard />
        {/if}
      {:else}
        <HeldTokensCard
          topHeldTokens={topHeldNonIcpTokens}
          usdAmount={nonIcpTokensBalanceInUsd}
          numberOfTopStakedTokens={topStakedNonIcpTokens.length}
        />
      {/if}

      <!-- REST NEURONS -->
      {#if stakedTokensCard === "skeleton"}
        <SkeletonTokensCard testId="staked-tokens-skeleton-card" />
      {:else if stakedTokensCard === "empty"}
        {#if $authSignedInStore}
          <NoStakedTokensCard />
        {/if}
      {:else}
        <StakedTokensCard
          topStakedTokens={topStakedNonIcpTokens}
          usdAmount={nonIcpStakedInUsd}
          numberOfTopHeldTokens={topHeldNonIcpTokens.length}
          hasApyCalculationErrored={isStakingRewardDataError(
            stakingRewardResult
          )}
          isApyLoading={isStakingRewardDataLoading(stakingRewardResult)}
        />
      {/if}
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
        row-gap: var(--padding-3x);
        column-gap: var(--padding-2x);

        grid-template-columns: repeat(2, 1fr);
        // minimum height with the icp only row
        grid-auto-rows: minmax(224px, min-content);
      }
    }
  }
</style>

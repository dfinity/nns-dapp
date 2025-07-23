<script lang="ts">
  import CardList from "$lib/components/launchpad/CardList.svelte";
  import AdoptedProposalCard from "$lib/components/portfolio/AdoptedProposalCard.svelte";
  import ApyCard from "$lib/components/portfolio/ApyCard.svelte";
  import ApyFallbackCard from "$lib/components/portfolio/ApyFallbackCard.svelte";
  import HeldTokensCard from "$lib/components/portfolio/HeldTokensCard.svelte";
  import LaunchpadBanner from "$lib/components/portfolio/LaunchpadBanner.svelte";
  import LaunchProjectCard from "$lib/components/portfolio/LaunchProjectCard.svelte";
  import LoginCard from "$lib/components/portfolio/LoginCard.svelte";
  import NewSnsProposalCard from "$lib/components/portfolio/NewSnsProposalCard.svelte";
  import NoHeldTokensCard from "$lib/components/portfolio/NoHeldTokensCard.svelte";
  import NoStakedTokensCard from "$lib/components/portfolio/NoStakedTokensCard.svelte";
  import SkeletonTokensCard from "$lib/components/portfolio/SkeletonTokensCard.svelte";
  import StackedCards from "$lib/components/portfolio/StackedCards.svelte";
  import StakedTokensCard from "$lib/components/portfolio/StakedTokensCard.svelte";
  import TotalAssetsCard from "$lib/components/portfolio/TotalAssetsCard.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import type { SnsFullProject } from "$lib/derived/sns/sns-projects.derived";
  import {
    isDesktopViewportStore,
    isMobileViewportStore,
  } from "$lib/derived/viewport.derived";
  import {
    ENABLE_APY_PORTFOLIO,
    ENABLE_LAUNCHPAD_REDESIGN,
  } from "$lib/stores/feature-flags.store";
  import type { TableProject } from "$lib/types/staking";
  import type { ComponentWithProps } from "$lib/types/svelte";
  import type { UserToken } from "$lib/types/tokens-page";
  import { getUpcomingLaunchesCards } from "$lib/utils/launchpad.utils";
  import {
    compareProposalInfoByDeadlineTimestampSeconds,
    getTopHeldTokens,
    getTopStakedTokens,
  } from "$lib/utils/portfolio.utils";
  import { comparesByDecentralizationSaleOpenTimestampDesc } from "$lib/utils/projects.utils";
  import {
    isStakingRewardDataError,
    isStakingRewardDataLoading,
    isStakingRewardDataReady,
    type StakingRewardResult,
  } from "$lib/utils/staking-rewards.utils";
  import { getTotalStakeInUsd } from "$lib/utils/staking.utils";
  import { getTotalBalanceInUsd } from "$lib/utils/token.utils";
  import type { ProposalInfo } from "@dfinity/nns";
  import { TokenAmountV2, isNullish, nonNullish } from "@dfinity/utils";
  import { type Component } from "svelte";

  type Props = {
    userTokens: UserToken[];
    tableProjects: TableProject[];
    snsProjects: SnsFullProject[];
    openSnsProposals: ProposalInfo[];
    adoptedSnsProposals: SnsFullProject[];
    stakingRewardResult?: StakingRewardResult;
  };

  const {
    userTokens = [],
    tableProjects,
    snsProjects,
    openSnsProposals,
    adoptedSnsProposals,
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
      ? "full"
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
      ? "full"
      : areStakedTokensLoading
        ? "skeleton"
        : totalStakedInUsd === 0
          ? "empty"
          : "full"
  );

  // Controls whether the staked tokens card should show a primary action
  // Primary action is shown when there are tokens but no stakes
  // This helps guide users to stake their tokens when possible
  const hasNoStakedTokensCardAPrimaryAction = $derived(
    stakedTokensCard === "empty" && heldTokensCard === "full"
  );

  // Global loading state that tracks if either held or staked tokens are loading
  // TotalAssetsCard will show this if either held or staked are loading
  const isSomethingLoading = $derived(
    areHeldTokensLoading || areStakedTokensLoading
  );

  const topHeldTokens = $derived(
    getTopHeldTokens({
      userTokens: userTokens,
      isSignedIn: $authSignedInStore,
    })
  );

  const tableProjectsWithApy: TableProject[] = $derived(
    isStakingRewardDataReady(stakingRewardResult)
      ? tableProjects.map((project) => ({
          ...project,
          apy: stakingRewardResult.apy.get(project.universeId) ?? undefined,
        }))
      : tableProjects
  );
  const topStakedTokens = $derived(
    getTopStakedTokens({
      projects: tableProjectsWithApy,
      isSignedIn: $authSignedInStore,
    })
  );

  // TODO: Remove once ENABLE_LAUNCHPAD_REDESIGN && ENABLE_APY_PORTFOLIO are removed
  const launchpadCards = $derived(
    [...snsProjects]
      .sort(comparesByDecentralizationSaleOpenTimestampDesc)
      .reverse()
      .map((project) => project.summary)
      .map<ComponentWithProps>((summary) => ({
        // TODO: Svelte v5 migration - fix type
        Component: LaunchProjectCard as unknown as Component,
        props: { summary },
      }))
  );

  // TODO: Remove once ENABLE_LAUNCHPAD_REDESIGN && ENABLE_APY_PORTFOLIO are removed
  const openProposalCards = $derived(
    [...openSnsProposals]
      .sort(compareProposalInfoByDeadlineTimestampSeconds)
      .map((proposalInfo) => ({
        // TODO: Svelte v5 migration - fix type
        Component: NewSnsProposalCard as unknown as Component,
        props: { proposalInfo },
      }))
  );

  // TODO: Remove once ENABLE_LAUNCHPAD_REDESIGN && ENABLE_APY_PORTFOLIO are removed
  const adoptedSnsProposalsCards = $derived(
    [...adoptedSnsProposals]
      .sort(comparesByDecentralizationSaleOpenTimestampDesc)
      .reverse()
      .map((project) => project.summary)
      .map<ComponentWithProps>((summary) => ({
        // TODO: Svelte v5 migration - fix type
        Component: AdoptedProposalCard as unknown as Component,
        props: { summary },
      }))
  );

  const cards: ComponentWithProps[] = $derived(
    $ENABLE_LAUNCHPAD_REDESIGN && $ENABLE_APY_PORTFOLIO
      ? getUpcomingLaunchesCards({
          snsProjects: [...snsProjects, ...adoptedSnsProposals],
          openSnsProposals,
        })
      : [...launchpadCards, ...openProposalCards, ...adoptedSnsProposalsCards]
  );
</script>

<main data-tid="portfolio-page-component">
  <div
    class="top"
    class:signed-in={$authSignedInStore}
    class:launchpad={cards.length > 0}
    class:apy-card={$ENABLE_APY_PORTFOLIO}
  >
    {#if !$authSignedInStore}
      <div class="login-card">
        <LoginCard />
      </div>
    {:else}
      <TotalAssetsCard
        usdAmount={totalUsdAmount}
        hasUnpricedTokens={hasUnpricedTokensOrStake}
        isLoading={isSomethingLoading}
        isFullWidth={cards.length === 0 && !$ENABLE_APY_PORTFOLIO}
      />

      {#if $ENABLE_APY_PORTFOLIO && $isDesktopViewportStore && nonNullish(totalUsdAmount)}
        {#if isStakingRewardDataReady(stakingRewardResult)}
          <ApyCard
            rewardBalanceUSD={stakingRewardResult.rewardBalanceUSD}
            rewardEstimateWeekUSD={stakingRewardResult.rewardEstimateWeekUSD}
            stakingPower={stakingRewardResult.stakingPower}
            stakingPowerUSD={stakingRewardResult.stakingPowerUSD}
            totalAmountUSD={totalUsdAmount}
          />
        {:else}
          <ApyFallbackCard stakingRewardData={stakingRewardResult} />
        {/if}
      {/if}
    {/if}

    {#if cards.length > 0}
      {#if $ENABLE_LAUNCHPAD_REDESIGN && $ENABLE_APY_PORTFOLIO && $isMobileViewportStore}
        <CardList
          testId="stacked-cards"
          {cards}
          mobileHorizontalScroll={cards.length > 1}
        />
      {:else}
        <StackedCards {cards} />
      {/if}
    {/if}

    {#if $ENABLE_APY_PORTFOLIO && !$isDesktopViewportStore && $authSignedInStore && nonNullish(totalUsdAmount) && nonNullish(stakingRewardResult)}
      {#if isStakingRewardDataReady(stakingRewardResult)}
        <ApyCard
          rewardBalanceUSD={stakingRewardResult.rewardBalanceUSD}
          rewardEstimateWeekUSD={stakingRewardResult.rewardEstimateWeekUSD}
          stakingPower={stakingRewardResult.stakingPower}
          stakingPowerUSD={stakingRewardResult.stakingPowerUSD}
          totalAmountUSD={totalUsdAmount}
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
      <NoStakedTokensCard primaryCard={hasNoStakedTokensCardAPrimaryAction} />
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

  {#if $ENABLE_LAUNCHPAD_REDESIGN}
    <LaunchpadBanner />
  {/if}
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
        grid-template-columns: 1fr 2fr;

        .login-card {
          height: 100%;
        }

        // Case: not signed in, with projects
        &:not(.signed-in).launchpad {
          grid-template-columns: 2fr 1fr;
        }

        // Case: not signed in, with no projects
        &:not(.signed-in):not(.launchpad) {
          grid-template-columns: 1fr;
        }

        // Case: signed in, no projects
        &.signed-in {
          grid-template-columns: 3fr;
        }

        // Case: signed in, with projects
        &.signed-in.launchpad {
          grid-template-columns: 2fr 1fr;
        }

        // Case: signed in, with APY card
        &.signed-in.apy-card {
          grid-template-columns: 2fr 1fr;
        }

        // Case: signed in, with APY card and projects
        &.signed-in.apy-card.launchpad {
          grid-template-columns: 1fr 1fr 1fr;
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

<script lang="ts">
  import CardList from "$lib/components/launchpad/CardList.svelte";
  import FavProjectOnlyToggle from "$lib/components/launchpad/FavProjectOnlyToggle.svelte";
  import ProjectCard2 from "$lib/components/launchpad/ProjectCard2.svelte";
  import SkeletonProjectCard from "$lib/components/launchpad/SkeletonProjectCard.svelte";
  import { icpSwapUsdPricesStore } from "$lib/derived/icp-swap.derived";
  import { snsFavProjectsToggleVisibleStore } from "$lib/derived/sns-fav-projects.derived";
  import type { SnsFullProject } from "$lib/derived/sns/sns-projects.derived";
  import { snsTotalSupplyTokenAmountStore } from "$lib/derived/sns/sns-total-supply-token-amount.derived";
  import { isMobileViewportStore } from "$lib/derived/viewport.derived";
  import { i18n } from "$lib/stores/i18n";
  import { snsFavProjectsVisibilityStore } from "$lib/stores/sns-fav-projects-visibility.store";
  import { snsFavProjectsStore } from "$lib/stores/sns-fav-projects.store";
  import type { ComponentWithProps } from "$lib/types/svelte";
  import {
    compareLaunchpadSnsProjects,
    getUpcomingLaunchesCards,
  } from "$lib/utils/launchpad.utils";
  import {
    comparesByDecentralizationSaleOpenTimestampDesc,
    filterProjectsStatus,
  } from "$lib/utils/projects.utils";
  import { isSnsProjectFavorite } from "$lib/utils/sns-fav-projects.utils";
  import { getCommitmentE8s } from "$lib/utils/sns.utils";
  import type { ProposalInfo } from "@dfinity/nns";
  import { SnsSwapLifecycle } from "@dfinity/sns";
  import { isNullish } from "@dfinity/utils";
  import type { Component } from "svelte";

  type Props = {
    snsProjects: SnsFullProject[];
    openSnsProposals: ProposalInfo[];
    isLoading: boolean;
  };

  const { snsProjects, openSnsProposals, isLoading }: Props = $props();

  const upcomingLaunchesCards = $derived(
    getUpcomingLaunchesCards({
      snsProjects,
      openSnsProposals,
    })
  );
  const launchedSnsProjects = $derived(
    filterProjectsStatus({
      swapLifecycle: SnsSwapLifecycle.Committed,
      projects: snsProjects,
    }).sort(comparesByDecentralizationSaleOpenTimestampDesc)
  );
  const visibleLaunchedSnsProjects = $derived(
    launchedSnsProjects.filter((project) =>
      $snsFavProjectsToggleVisibleStore &&
      $snsFavProjectsVisibilityStore === "fav"
        ? isSnsProjectFavorite({
            project,
            favProjects: $snsFavProjectsStore.rootCanisterIds,
          })
        : launchedSnsProjects
    )
  );
  const userCommittedSnsProjects = $derived(
    visibleLaunchedSnsProjects
      .filter(
        ({ swapCommitment }) => getCommitmentE8s(swapCommitment) ?? 0n > 0n
      )
      .sort(
        compareLaunchpadSnsProjects({
          snsTotalSupplyTokenAmountStore: $snsTotalSupplyTokenAmountStore,
          icpSwapUsdPricesStore: $icpSwapUsdPricesStore,
        })
      )
      .map((project) => ({
        Component: ProjectCard2 as unknown as Component,
        props: { project },
      }))
  );
  const notCommittedSnsProjects = $derived(
    visibleLaunchedSnsProjects
      .filter(
        ({ swapCommitment }) =>
          isNullish(getCommitmentE8s(swapCommitment)) ||
          getCommitmentE8s(swapCommitment) === 0n
      )
      .sort(
        compareLaunchpadSnsProjects({
          snsTotalSupplyTokenAmountStore: $snsTotalSupplyTokenAmountStore,
          icpSwapUsdPricesStore: $icpSwapUsdPricesStore,
        })
      )
      .map((project) => ({
        Component: ProjectCard2 as unknown as Component,
        props: { project },
      }))
  );
  const launchedSnsProjectsCards: ComponentWithProps[] = $derived([
    ...userCommittedSnsProjects,
    ...notCommittedSnsProjects,
  ]);
  const skeletonCards: ComponentWithProps[] = $derived(
    Array.from({ length: 3 }, () => ({
      Component: SkeletonProjectCard as unknown as Component,
      props: {},
    }))
  );
</script>

<main data-tid="launchpad2-component">
  <div class="header">
    <div>
      <h3>{$i18n.launchpad.headline}</h3>
      <p>{$i18n.launchpad.subheadline}</p>
    </div>
    <FavProjectOnlyToggle />
  </div>

  {#if upcomingLaunchesCards.length > 0}
    <section>
      <h4>{$i18n.launchpad.upcoming_launches}</h4>
      <CardList
        testId="upcoming-launches-list"
        cards={upcomingLaunchesCards}
        mobileHorizontalScroll={upcomingLaunchesCards.length > 1}
      />
    </section>
  {/if}

  {#if $isMobileViewportStore && userCommittedSnsProjects.length > 0}
    <section>
      <h4>{$i18n.launchpad.participated_projects}</h4>
      <CardList
        testId="user-committed-projects-list"
        cards={userCommittedSnsProjects}
        mobileHorizontalScroll={userCommittedSnsProjects.length > 1}
      />
    </section>
  {/if}

  <section>
    <h4>{$i18n.launchpad.launched_projects}</h4>
    {#if isLoading}
      <CardList testId="skeleton-projects-list" cards={skeletonCards} />
    {:else}
      <CardList
        testId="launched-projects-list"
        cards={$isMobileViewportStore
          ? notCommittedSnsProjects
          : launchedSnsProjectsCards}
      />
    {/if}
  </section>
</main>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  main {
    display: flex;
    flex-direction: column;
    gap: var(--padding-3x);
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--padding-2x);
  }

  h3 {
    font-family: "CircularXX TT";
    font-size: 20px;
    font-weight: 500;
    line-height: 32px;

    @include media.min-width(medium) {
      font-size: 24px;
    }
  }

  section {
    margin: 0;
    padding: 0;
    max-width: none;
  }

  h4 {
    font-size: 14px;
    font-weight: 450;
    line-height: 18px;
    margin: var(--padding) 0;

    @include media.min-width(medium) {
      font-size: 16px;
      line-height: 20px;
    }
  }

  p {
    margin: 0;

    font-family: "CircularXX TT";
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 24px;
    color: var(--text-description);
  }
</style>

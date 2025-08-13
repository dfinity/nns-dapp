<script lang="ts">
  import CardList from "$lib/components/launchpad/CardList.svelte";
  import ProjectCard2 from "$lib/components/launchpad/ProjectCard2.svelte";
  import SkeletonProjectCard from "$lib/components/launchpad/SkeletonProjectCard.svelte";
  import { FEATURED_SNS_PROJECTS } from "$lib/constants/sns.constants";
  import { icpSwapUsdPricesStore } from "$lib/derived/icp-swap.derived";
  import type { SnsFullProject } from "$lib/derived/sns/sns-projects.derived";
  import { snsTotalSupplyTokenAmountStore } from "$lib/derived/sns/sns-total-supply-token-amount.derived";
  import { i18n } from "$lib/stores/i18n";
  import type { ComponentWithProps } from "$lib/types/svelte";
  import {
    compareLaunchpadSnsProjects,
    getUpcomingLaunchesCards,
  } from "$lib/utils/launchpad.utils";
  import {
    comparesByDecentralizationSaleOpenTimestampDesc,
    filterProjectsStatus,
  } from "$lib/utils/projects.utils";
  import type { ProposalInfo } from "@dfinity/nns";
  import { SnsSwapLifecycle } from "@dfinity/sns";
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
  const featuredCards = $derived(
    launchedSnsProjects
      .filter((project) =>
        FEATURED_SNS_PROJECTS.includes(project.rootCanisterId.toText())
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
  const restProjectCards = $derived(
    launchedSnsProjects
      .filter(
        (project) =>
          !FEATURED_SNS_PROJECTS.includes(project.rootCanisterId.toText())
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
  const skeletonCards: ComponentWithProps[] = $derived(
    Array.from({ length: 3 }, () => ({
      Component: SkeletonProjectCard as unknown as Component,
      props: {},
    }))
  );
</script>

<main data-tid="launchpad2-component">
  <h3>{$i18n.launchpad.headline}</h3>

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

  <section>
    <h4>{$i18n.launchpad.featured_projects}</h4>
    {#if isLoading}
      <CardList testId="skeleton-projects-list" cards={skeletonCards} />
    {:else}
      <CardList testId="featured-projects-list" cards={featuredCards} />
    {/if}
  </section>

  <section>
    <h4>{$i18n.launchpad.all_projects}</h4>
    {#if isLoading}
      <CardList testId="skeleton-projects-list" cards={skeletonCards} />
    {:else}
      <CardList testId="rest-projects-list" cards={restProjectCards} />
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

  h3 {
    font-family: "CircularXX";
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
</style>

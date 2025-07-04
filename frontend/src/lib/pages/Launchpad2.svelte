<script lang="ts">
  import CardList from "$lib/components/launchpad/CardList.svelte";
  import ProjectCard from "$lib/components/launchpad/ProjectCard.svelte";
  import type { SnsFullProject } from "$lib/derived/sns/sns-projects.derived";
  import { i18n } from "$lib/stores/i18n";
  import type { ComponentWithProps } from "$lib/types/svelte";
  import { getUpcomingLaunchesCards } from "$lib/utils/launchpad.utils";
  import {
    comparesByDecentralizationSaleOpenTimestampDesc,
    filterProjectsStatus,
  } from "$lib/utils/projects.utils";
  import { getCommitmentE8s } from "$lib/utils/sns.utils";
  import type { ProposalInfo } from "@dfinity/nns";
  import { SnsSwapLifecycle } from "@dfinity/sns";
  import { isNullish } from "@dfinity/utils";
  import type { Component } from "svelte";

  type Props = {
    snsProjects: SnsFullProject[];
    openSnsProposals: ProposalInfo[];
  };

  const { snsProjects, openSnsProposals }: Props = $props();

  // TODO(launchpad2): add skeletons on loading.

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
  const userCommittedSnsProjects = $derived(
    launchedSnsProjects
      .filter(
        ({ swapCommitment }) => getCommitmentE8s(swapCommitment) ?? 0n > 0n
      )
      .map((project) => ({
        Component: ProjectCard as unknown as Component,
        props: { project },
      }))
  );
  const notCommittedSnsProjects = $derived(
    launchedSnsProjects
      .filter(
        ({ swapCommitment }) =>
          isNullish(getCommitmentE8s(swapCommitment)) ||
          getCommitmentE8s(swapCommitment) === 0n
      )
      .map((project) => ({
        Component: ProjectCard as unknown as Component,
        props: { project },
      }))
  );
  const launchedSnsProjectsCards: ComponentWithProps[] = $derived([
    ...userCommittedSnsProjects,
    ...notCommittedSnsProjects,
  ]);
</script>

<main data-tid="launchpad2-component">
  <div class="header">
    <h3>{$i18n.launchpad.headline}</h3>
    <p>{$i18n.launchpad.subheadline}</p>
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

  {#if userCommittedSnsProjects.length > 0}
    <section class="mobile-only">
      <h4>{$i18n.launchpad.participated_projects}</h4>
      <CardList
        testId="launched-projects-list"
        cards={userCommittedSnsProjects}
        mobileHorizontalScroll={userCommittedSnsProjects.length > 1}
      />
    </section>
  {/if}

  {#if notCommittedSnsProjects.length > 0}
    <section class="mobile-only">
      <h4>{$i18n.launchpad.launched_projects}</h4>
      <CardList
        testId="launched-projects-list"
        cards={notCommittedSnsProjects}
      />
    </section>
  {/if}

  {#if launchedSnsProjectsCards.length > 0}
    <section class="desktop-only">
      <h4>{$i18n.launchpad.launched_projects}</h4>
      <CardList
        testId="launched-projects-list"
        cards={launchedSnsProjectsCards}
      />
    </section>
  {/if}
</main>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .desktop-only {
    display: none;
    @include media.min-width(medium) {
      display: block;
    }
  }
  .mobile-only {
    @include media.min-width(medium) {
      display: none;
    }
  }

  main {
    display: flex;
    flex-direction: column;
    gap: var(--padding-3x);
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

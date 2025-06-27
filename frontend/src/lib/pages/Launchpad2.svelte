<script lang="ts">
  import CardList from "$lib/components/launchpad/CardList.svelte";
  import ProjectCard from "$lib/components/launchpad/ProjectCard.svelte";
  import AdoptedProposalCard from "$lib/components/portfolio/AdoptedProposalCard.svelte";
  import LaunchProjectCard from "$lib/components/portfolio/LaunchProjectCard.svelte";
  import NewSnsProposalCard from "$lib/components/portfolio/NewSnsProposalCard.svelte";
  import type { SnsFullProject } from "$lib/derived/sns/sns-projects.derived";
  import { i18n } from "$lib/stores/i18n";
  import type { ComponentWithProps } from "$lib/types/svelte";
  import { compareProposalInfoByDeadlineTimestampSeconds } from "$lib/utils/portfolio.utils";
  import {
    comparesByDecentralizationSaleOpenTimestampDesc,
    filterProjectsStatus,
  } from "$lib/utils/projects.utils";
  import { getCommitmentE8s } from "$lib/utils/sns.utils";
  import type { ProposalInfo } from "@dfinity/nns";
  import { SnsSwapLifecycle } from "@dfinity/sns";
  import type { Component } from "svelte";

  type Props = {
    snsProjects: SnsFullProject[];
    openSnsProposals: ProposalInfo[];
    adoptedSnsProposals: SnsFullProject[];
  };

  const { snsProjects, openSnsProposals, adoptedSnsProposals }: Props =
    $props();

  const openSnsProjects = $derived(
    filterProjectsStatus({
      swapLifecycle: SnsSwapLifecycle.Open,
      projects: snsProjects,
    })
  );
  const launchedSnsCards: ComponentWithProps[] = $derived(
    [...openSnsProjects]
      .sort(comparesByDecentralizationSaleOpenTimestampDesc)
      .reverse()
      .map((project) => project.summary)
      .map<ComponentWithProps>((summary) => ({
        Component: LaunchProjectCard as unknown as Component,
        props: { summary },
      }))
  );
  const openProposalCards: ComponentWithProps[] = $derived(
    [...openSnsProposals]
      .sort(compareProposalInfoByDeadlineTimestampSeconds)
      .map((proposalInfo) => ({
        Component: NewSnsProposalCard as unknown as Component,
        props: { proposalInfo },
      }))
  );
  const adoptedSnsProposalsCards = $derived(
    [...adoptedSnsProposals]
      .sort(comparesByDecentralizationSaleOpenTimestampDesc)
      .reverse()
      .map((project) => project.summary)
      .map<ComponentWithProps>((summary) => ({
        Component: AdoptedProposalCard as unknown as Component,
        props: { summary },
      }))
  );
  const newLaunchesCards: ComponentWithProps[] = $derived([
    ...launchedSnsCards,
    ...openProposalCards,
    ...adoptedSnsProposalsCards,
  ]);
  const launchedSnsProjects = $derived(
    filterProjectsStatus({
      swapLifecycle: SnsSwapLifecycle.Committed,
      projects: snsProjects,
    }).sort(comparesByDecentralizationSaleOpenTimestampDesc)
  );
  const userCommittedSnsProjects = $derived(
    launchedSnsProjects.filter(
      ({ swapCommitment }) => getCommitmentE8s(swapCommitment) ?? 0n > 0n
    )
  );
  const notCommittedSnsProjects = $derived(
    launchedSnsProjects.filter(
      ({ swapCommitment }) => !getCommitmentE8s(swapCommitment)
    )
  );
  const launchedSnsProjectsCards: ComponentWithProps[] = $derived(
    [...userCommittedSnsProjects, ...notCommittedSnsProjects].map(
      (project) => ({
        Component: ProjectCard as unknown as Component,
        props: { project },
      })
    )
  );
</script>

<main data-tid="launchpad2-component">
  <div class="header">
    <h3>{$i18n.launchpad.headline}</h3>
    <p>{$i18n.launchpad.subheadline}</p>
  </div>
  <section>
    <h4>{$i18n.launchpad.upcoming_launches}</h4>
    <CardList testId="upcoming-launches-list" cards={newLaunchesCards} />
  </section>
  <section>
    <h4>{$i18n.launchpad.launched_projects}</h4>
    <CardList
      testId="launched-projects-list"
      cards={launchedSnsProjectsCards}
    />
  </section>
</main>

<style lang="scss">
  main {
    display: flex;
    flex-direction: column;
    gap: var(--padding-3x);
  }

  h3 {
    font-family: "CircularXX TT";
    font-size: 24px;
    font-weight: 500;
    line-height: 32px;
  }

  section {
    margin: 0;
    padding: 0;
    max-width: none;
  }

  h4 {
    font-size: 16px;
    font-weight: 450;
    line-height: 20px;
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

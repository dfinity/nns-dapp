<script lang="ts">
  import CardSection from "$lib/components/launchpad/CardSection.svelte";
  import ProjectCard from "$lib/components/launchpad/ProjectCard.svelte";
  import AdoptedProposalCard from "$lib/components/portfolio/AdoptedProposalCard.svelte";
  import LaunchProjectCard from "$lib/components/portfolio/LaunchProjectCard.svelte";
  import NewSnsProposalCard from "$lib/components/portfolio/NewSnsProposalCard.svelte";
  import { snsProjectsActivePadStore } from "$lib/derived/sns/sns-projects.derived";
  import { loadIcpSwapTickers } from "$lib/services/icp-swap.services";
  import { loadProposalsSnsCF } from "$lib/services/public/sns.services";
  import {
    openSnsProposalsStore,
    snsProposalsStoreIsLoading,
  } from "$lib/stores/sns.store";
  import type { ComponentWithProps } from "$lib/types/svelte";
  import { compareProposalInfoByDeadlineTimestampSeconds } from "$lib/utils/portfolio.utils";
  import {
    comparesByDecentralizationSaleOpenTimestampDesc,
    filterProjectsStatus,
  } from "$lib/utils/projects.utils";
  import { getCommitmentE8s } from "$lib/utils/sns.utils";
  import { SnsSwapLifecycle } from "@dfinity/sns";
  import type { Component } from "svelte";

  loadIcpSwapTickers();

  $effect(() => {
    if ($snsProposalsStoreIsLoading) {
      loadProposalsSnsCF({ omitLargeFields: false });
    }
  });

  const openSnsProjects = $derived(
    filterProjectsStatus({
      swapLifecycle: SnsSwapLifecycle.Open,
      projects: $snsProjectsActivePadStore,
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
  const openSnsProposals = $derived($openSnsProposalsStore);
  const openProposalCards: ComponentWithProps[] = $derived(
    [...openSnsProposals]
      .sort(compareProposalInfoByDeadlineTimestampSeconds)
      .map((proposalInfo) => ({
        Component: NewSnsProposalCard as unknown as Component,
        props: { proposalInfo },
      }))
  );
  // Upcoming SNS projects
  const adoptedSnsProposals = $derived(
    filterProjectsStatus({
      // TODO(launchpad): restore me!
      // swapLifecycle: SnsSwapLifecycle.Adopted,
      swapLifecycle: SnsSwapLifecycle.Open,
      projects: $snsProjectsActivePadStore,
    })
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
      projects: $snsProjectsActivePadStore,
    })
  );
  const userCommittedSnsProjects = $derived(
    launchedSnsProjects
      .filter(
        ({ swapCommitment }) => getCommitmentE8s(swapCommitment) ?? 0n > 0n
      )
      .sort(comparesByDecentralizationSaleOpenTimestampDesc)
  );
  const notCommittedSnsProjects = $derived(
    launchedSnsProjects.filter(
      ({ swapCommitment }) => getCommitmentE8s(swapCommitment) ?? 0n === 0n
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

<main data-tid="launchpad-component">
  <div class="header">
    <h2>Discover SNS Projects</h2>
    <p>See upcoming and available SNS projects</p>

    <div class="actions"> </div>
  </div>

  <CardSection title="New Launches and Proposals" cards={newLaunchesCards} />
  <CardSection title="Launched Projects" cards={launchedSnsProjectsCards} />
</main>

<style lang="scss">
  main {
    display: flex;
    flex-direction: column;
    gap: var(--padding-3x);
  }

  h2 {
    font-family: "CircularXX TT";
    font-size: 24px;
    font-weight: 500;
    line-height: 32px;
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

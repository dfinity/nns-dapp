<script lang="ts">
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { icpSwapUsdPricesStore } from "$lib/derived/icp-swap.derived";
  import { selectableUniversesStore } from "$lib/derived/selectable-universes.derived";
  import { snsProjectsActivePadStore } from "$lib/derived/sns/sns-projects.derived";
  import { loadIcpSwapTickers } from "$lib/services/icp-swap.services";
  import { loadProposalsSnsCF } from "$lib/services/public/sns.services";
  import { failedActionableSnsesStore } from "$lib/stores/actionable-sns-proposals.store";
  import { neuronsStore } from "$lib/stores/neurons.store";
  import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
  import {
    openSnsProposalsStore,
    snsProposalsStoreIsLoading,
  } from "$lib/stores/sns.store";
  import {
    comparesByDecentralizationSaleOpenTimestampDesc,
    filterProjectsStatus,
  } from "$lib/utils/projects.utils";
  import { SnsSwapLifecycle } from "@dfinity/sns";
  import type { Component } from "svelte";
  import AdoptedProposalCard from "$lib/components/portfolio/AdoptedProposalCard.svelte";
  import LaunchProjectCard from "$lib/components/portfolio/LaunchProjectCard.svelte";
  import NewSnsProposalCard from "$lib/components/portfolio/NewSnsProposalCard.svelte";
  import type { CardItem } from "$lib/components/portfolio/StackedCards.svelte";
  import { compareProposalInfoByDeadlineTimestampSeconds } from "$lib/utils/portfolio.utils";
  import Projects from "../components/launchpad/Projects.svelte";
  import CardSection from "../components/launchpad/CardSection.svelte";
  import { getCommitmentE8s } from "../utils/sns.utils";
  import ProjectCard from "../components/launchpad/ProjectCard.svelte";

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
  const launchedSnsCards = $derived(
    [...openSnsProjects]
      .sort(comparesByDecentralizationSaleOpenTimestampDesc)
      .reverse()
      .map((project) => project.summary)
      .map<CardItem>((summary) => ({
        // TODO: Svelte v5 migration - fix type
        component: LaunchProjectCard as unknown as Component,
        props: { summary },
      }))
  );
  const openSnsProposals = $derived($openSnsProposalsStore);
  const openProposalCards = $derived(
    [...openSnsProposals]
      .sort(compareProposalInfoByDeadlineTimestampSeconds)
      .map((proposalInfo) => ({
        component: NewSnsProposalCard as unknown as Component,
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
      .map<CardItem>((summary) => ({
        // TODO: Svelte v5 migration - fix type
        component: AdoptedProposalCard as unknown as Component,
        props: { summary },
      }))
  );

  const newLaunchesCards: CardItem[] = $derived([
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
  const sortedLaunchedSnsProjects = $derived([
    ...userCommittedSnsProjects,
    ...notCommittedSnsProjects,
  ]);
</script>

<main data-tid="launchpad-component">
  <div class="header">
    <h2>Discover SNS Projects</h2>
    <p>See upcoming and available SNS projects</p>

    <div class="actions"> </div>
  </div>

  <CardSection title="New Launches and Proposals">
    {#each newLaunchesCards as card, i}
      <div class="card-wrapper">
        <card.component {...card.props} />
      </div>
    {/each}
  </CardSection>

  <CardSection title="Launched Projects">
    {#each sortedLaunchedSnsProjects as project (project.rootCanisterId.toText())}
      <ProjectCard {project} />
    {/each}
  </CardSection>
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
    font-family: "CircularXX TT";
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 24px;
    color: var(--text-description);
  }
</style>

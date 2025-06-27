<script lang="ts">
  import CardList from "$lib/components/launchpad/CardList.svelte";
  import AdoptedProposalCard from "$lib/components/portfolio/AdoptedProposalCard.svelte";
  import LaunchProjectCard from "$lib/components/portfolio/LaunchProjectCard.svelte";
  import NewSnsProposalCard from "$lib/components/portfolio/NewSnsProposalCard.svelte";
  import type { SnsFullProject } from "$lib/derived/sns/sns-projects.derived";
  import type { ComponentWithProps } from "$lib/types/svelte";
  import { compareProposalInfoByDeadlineTimestampSeconds } from "$lib/utils/portfolio.utils";
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
</script>

<CardList testId="upcoming-launches-cards-component" cards={newLaunchesCards} />

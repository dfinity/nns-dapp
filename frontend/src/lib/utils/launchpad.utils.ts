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

export const getUpcomingLaunchesCards = ({
  snsProjects,
  openSnsProposals,
}: {
  snsProjects: SnsFullProject[];
  openSnsProposals: ProposalInfo[];
}): ComponentWithProps[] => {
  const launchedSnsCards: ComponentWithProps[] = filterProjectsStatus({
    swapLifecycle: SnsSwapLifecycle.Open,
    projects: snsProjects,
  })
    .sort(comparesByDecentralizationSaleOpenTimestampDesc)
    .reverse()
    .map<ComponentWithProps>(({ summary }) => ({
      Component: LaunchProjectCard as unknown as Component,
      props: { summary },
    }));

  const adoptedSnsProposalCards = filterProjectsStatus({
    swapLifecycle: SnsSwapLifecycle.Adopted,
    projects: snsProjects,
  })
    .sort(comparesByDecentralizationSaleOpenTimestampDesc)
    .reverse()
    .map<ComponentWithProps>(({ summary }) => ({
      Component: AdoptedProposalCard as unknown as Component,
      props: { summary },
    }));

  const openProposalCards: ComponentWithProps[] = [...openSnsProposals]
    .sort(compareProposalInfoByDeadlineTimestampSeconds)
    .map((proposalInfo) => ({
      Component: NewSnsProposalCard as unknown as Component,
      props: { proposalInfo },
    }));

  return [
    ...launchedSnsCards,
    ...openProposalCards,
    ...adoptedSnsProposalCards,
  ];
};

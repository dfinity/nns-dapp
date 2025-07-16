import CreateSnsProposalCard from "$lib/components/launchpad/CreateSnsProposalCard.svelte";
import OngoingProjectCard from "$lib/components/launchpad/OngoingProjectCard.svelte";
import UpcomingProjectCard from "$lib/components/launchpad/UpcomingProjectCard.svelte";
import type { IcpSwapUsdPricesStoreData } from "$lib/derived/icp-swap.derived";
import type { SnsFullProject } from "$lib/derived/sns/sns-projects.derived";
import type { ComponentWithProps } from "$lib/types/svelte";
import { compareProposalInfoByDeadlineTimestampSeconds } from "$lib/utils/portfolio.utils";
import {
  comparesByDecentralizationSaleOpenTimestampDesc,
  filterProjectsStatus,
  snsProjectIcpInTreasuryPercentage,
  snsProjectMarketCap,
  snsProjectWeeklyProposalActivity,
} from "$lib/utils/projects.utils";
import {
  createAscendingComparator,
  createDescendingComparator,
  mergeComparators,
} from "$lib/utils/sort.utils";
import type { ProposalInfo } from "@dfinity/nns";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { TokenAmountV2 } from "@dfinity/utils";
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
      Component: OngoingProjectCard as unknown as Component,
      props: { summary },
    }));

  const adoptedSnsProposalCards = filterProjectsStatus({
    swapLifecycle: SnsSwapLifecycle.Adopted,
    projects: snsProjects,
  })
    .sort(comparesByDecentralizationSaleOpenTimestampDesc)
    .reverse()
    .map<ComponentWithProps>(({ summary }) => ({
      Component: UpcomingProjectCard as unknown as Component,
      props: { summary },
    }));

  const openProposalCards: ComponentWithProps[] = [...openSnsProposals]
    .sort(compareProposalInfoByDeadlineTimestampSeconds)
    .map((proposalInfo) => ({
      Component: CreateSnsProposalCard as unknown as Component,
      props: { proposalInfo },
    }));

  return [
    ...launchedSnsCards,
    ...openProposalCards,
    ...adoptedSnsProposalCards,
  ];
};

export const compareSnsProjectsUndefinedIcpTreasuryLast =
  createAscendingComparator(
    (project: SnsFullProject) =>
      snsProjectIcpInTreasuryPercentage(project) === undefined
  );

export const compareSnsProjectsUndefinedProposalActivityLast =
  createAscendingComparator(
    (project: SnsFullProject) =>
      snsProjectWeeklyProposalActivity(project) === undefined
  );

export const compareSnsProjectsUndefinedMarketCapLast = ({
  snsTotalSupplyTokenAmountStore,
  icpSwapUsdPricesStore,
}: {
  snsTotalSupplyTokenAmountStore: Record<string, TokenAmountV2>;
  icpSwapUsdPricesStore: IcpSwapUsdPricesStoreData;
}) =>
  createAscendingComparator(
    (project: SnsFullProject) =>
      snsProjectMarketCap({
        sns: project,
        snsTotalSupplyTokenAmountStore,
        icpSwapUsdPricesStore,
      }) === undefined
  );

export const compareSnsProjectsByProposalActivity = createDescendingComparator(
  (project: SnsFullProject) => snsProjectWeeklyProposalActivity(project)
);

export const compareSnsProjectsByMarketCap = ({
  snsTotalSupplyTokenAmountStore,
  icpSwapUsdPricesStore,
}: {
  snsTotalSupplyTokenAmountStore: Record<string, TokenAmountV2>;
  icpSwapUsdPricesStore: IcpSwapUsdPricesStoreData;
}) =>
  createDescendingComparator(
    (project: SnsFullProject) =>
      snsProjectMarketCap({
        sns: project,
        snsTotalSupplyTokenAmountStore,
        icpSwapUsdPricesStore,
      }) ?? 0n
  );

export const compareLaunchpadSnsProjects = ({
  snsTotalSupplyTokenAmountStore,
  icpSwapUsdPricesStore,
}: {
  snsTotalSupplyTokenAmountStore: Record<string, TokenAmountV2>;
  icpSwapUsdPricesStore: IcpSwapUsdPricesStoreData;
}) =>
  mergeComparators([
    compareSnsProjectsUndefinedProposalActivityLast,
    compareSnsProjectsUndefinedIcpTreasuryLast,
    compareSnsProjectsUndefinedMarketCapLast({
      snsTotalSupplyTokenAmountStore,
      icpSwapUsdPricesStore,
    }),
    compareSnsProjectsByProposalActivity,
    compareSnsProjectsByMarketCap({
      snsTotalSupplyTokenAmountStore,
      icpSwapUsdPricesStore,
    }),
  ]);

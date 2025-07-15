import CreateSnsProposalCard from "$lib/components/launchpad/CreateSnsProposalCard.svelte";
import OngoingProjectCard from "$lib/components/launchpad/OngoingProjectCard.svelte";
import UpcomingProjectCard from "$lib/components/launchpad/UpcomingProjectCard.svelte";
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
import type { ProposalInfo } from "@dfinity/nns";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { isNullish, TokenAmountV2 } from "@dfinity/utils";
import type { Component } from "svelte";
import type { IcpSwapUsdPricesStoreData } from "../derived/icp-swap.derived";
import {
  createAscendingComparator,
  createDescendingComparator,
  mergeComparators,
} from "./sort.utils";

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
    swapLifecycle: SnsSwapLifecycle.Open,
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

const compareSnsProjectsUndefinedIcpTreasuryLast = createAscendingComparator(
  (project: SnsFullProject) =>
    snsProjectIcpInTreasuryPercentage(project) === undefined
);
const compareSnsProjectsUndefinedProposalActivityLast =
  createAscendingComparator(
    (project: SnsFullProject) =>
      snsProjectWeeklyProposalActivity(project) === undefined
  );
const compareSnsProjectsUndefinedPriceLast = (
  icpSwapData: IcpSwapUsdPricesStoreData
) =>
  createAscendingComparator((project: SnsFullProject) => {
    if (isNullish(icpSwapData) || icpSwapData === "error") return true;
    const ledgerCanisterId = project.summary.ledgerCanisterId.toText();
    return icpSwapData[ledgerCanisterId] === undefined;
  });
const compareSnsProjectsByUsdProposalActivity = createDescendingComparator(
  (project: SnsFullProject) => snsProjectWeeklyProposalActivity(project)
);
const compareSnsProjectsByMarketCap = ({
  snsTotalSupplyTokenAmountStore,
  icpSwapUsdPricesStore,
}: {
  snsTotalSupplyTokenAmountStore: Record<string, TokenAmountV2>;
  icpSwapUsdPricesStore: IcpSwapUsdPricesStoreData;
}) =>
  createDescendingComparator((project: SnsFullProject) =>
    snsProjectMarketCap({
      sns: project,
      snsTotalSupplyTokenAmountStore: snsTotalSupplyTokenAmountStore,
      icpSwapUsdPricesStore: icpSwapUsdPricesStore,
    })
  );

export const compareLaunchpadSnsProjects = ({
  icpSwapData,
  snsTotalSupplyTokenAmountStore,
  icpSwapUsdPricesStore,
}: {
  icpSwapData: IcpSwapUsdPricesStoreData;
  snsTotalSupplyTokenAmountStore: Record<string, TokenAmountV2>;
  icpSwapUsdPricesStore: IcpSwapUsdPricesStoreData;
}) =>
  mergeComparators([
    compareSnsProjectsUndefinedProposalActivityLast,
    compareSnsProjectsUndefinedIcpTreasuryLast,
    // This should cover the main reason having no market cap value
    compareSnsProjectsUndefinedPriceLast(icpSwapData),
    compareSnsProjectsByUsdProposalActivity,
    compareSnsProjectsByMarketCap({
      snsTotalSupplyTokenAmountStore,
      icpSwapUsdPricesStore,
    }),
  ]);

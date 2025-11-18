import CreateSnsProposalCard from "$lib/components/launchpad/CreateSnsProposalCard.svelte";
import OngoingProjectCard from "$lib/components/launchpad/OngoingProjectCard.svelte";
import UpcomingProjectCard from "$lib/components/launchpad/UpcomingProjectCard.svelte";
import { abandonedProjectsCanisterId } from "$lib/constants/canister-ids.constants";
import type { SnsFullProject } from "$lib/derived/sns/sns-projects.derived";
import type { ComponentWithProps } from "$lib/types/svelte";
import type { TickersStoreData } from "$lib/types/tickers";
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
import { SnsSwapLifecycle } from "@dfinity/sns";
import { TokenAmountV2 } from "@dfinity/utils";
import type { ProposalInfo } from "@icp-sdk/canisters/nns";
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

export const compareSnsProjectsAbandonedLast = createAscendingComparator(
  (project: SnsFullProject) =>
    abandonedProjectsCanisterId.includes(project.rootCanisterId.toText())
);

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
  tickersStore,
}: {
  snsTotalSupplyTokenAmountStore: Record<string, TokenAmountV2>;
  tickersStore: TickersStoreData;
}) =>
  createAscendingComparator(
    (project: SnsFullProject) =>
      snsProjectMarketCap({
        sns: project,
        snsTotalSupplyTokenAmountStore,
        tickersStore,
      }) === undefined
  );

export const compareSnsProjectsByProposalActivity = createDescendingComparator(
  (project: SnsFullProject) => snsProjectWeeklyProposalActivity(project)
);

export const compareSnsProjectsByMarketCap = ({
  snsTotalSupplyTokenAmountStore,
  tickersStore,
}: {
  snsTotalSupplyTokenAmountStore: Record<string, TokenAmountV2>;
  tickersStore: TickersStoreData;
}) =>
  createDescendingComparator(
    (project: SnsFullProject) =>
      snsProjectMarketCap({
        sns: project,
        snsTotalSupplyTokenAmountStore,
        tickersStore,
      }) ?? 0n
  );
export const compareSnsProjectsByIcpTreasury = createDescendingComparator(
  (project: SnsFullProject) => snsProjectIcpInTreasuryPercentage(project)
);

export const compareLaunchpadSnsProjects = ({
  snsTotalSupplyTokenAmountStore,
  tickersStore,
}: {
  snsTotalSupplyTokenAmountStore: Record<string, TokenAmountV2>;
  tickersStore: TickersStoreData;
}) =>
  mergeComparators([
    compareSnsProjectsAbandonedLast,
    compareSnsProjectsUndefinedProposalActivityLast,
    compareSnsProjectsUndefinedIcpTreasuryLast,
    compareSnsProjectsUndefinedMarketCapLast({
      snsTotalSupplyTokenAmountStore,
      tickersStore,
    }),
    compareSnsProjectsByMarketCap({
      snsTotalSupplyTokenAmountStore,
      tickersStore,
    }),
    compareSnsProjectsByProposalActivity,
    compareSnsProjectsByIcpTreasury,
  ]);

import CreateSnsProposalCard from "$lib/components/launchpad/CreateSnsProposalCard.svelte";
import OngoingProjectCard from "$lib/components/launchpad/OngoingProjectCard.svelte";
import UpcomingProjectCard from "$lib/components/launchpad/UpcomingProjectCard.svelte";
import { icpSwapUsdPricesStore } from "$lib/derived/icp-swap.derived";
import { snsTotalSupplyTokenAmountStore } from "$lib/derived/sns/sns-total-supply-token-amount.derived";
import {
  compareSnsProjectsByMarketCap,
  compareSnsProjectsByProposalActivity,
  compareSnsProjectsUndefinedIcpTreasuryLast,
  compareSnsProjectsUndefinedMarketCapLast,
  compareSnsProjectsUndefinedProposalActivityLast,
  getUpcomingLaunchesCards,
} from "$lib/utils/launchpad.utils";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import {
  createMockSnsFullProject,
  mockSnsMetrics,
  principal,
} from "$tests/mocks/sns-projects.mock";
import { setIcpSwapUsdPrices } from "$tests/utils/icp-swap.test-utils";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { ProposalStatus, Topic, type ProposalInfo } from "@dfinity/nns";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { get } from "svelte/store";

describe("Launchpad utils", () => {
  describe("getUpcomingLaunchesCards", () => {
    it('ignores not "Open" or "Adopted" sns projects', () => {
      const abortedSnsProject = createMockSnsFullProject({
        rootCanisterId: principal(1),
        summaryParams: {
          lifecycle: SnsSwapLifecycle.Aborted,
        },
      });
      const committedSnsProject = createMockSnsFullProject({
        rootCanisterId: principal(2),
        summaryParams: {
          lifecycle: SnsSwapLifecycle.Committed,
        },
      });
      const pendingSnsProject = createMockSnsFullProject({
        rootCanisterId: principal(3),
        summaryParams: {
          lifecycle: SnsSwapLifecycle.Pending,
        },
      });
      const cards = getUpcomingLaunchesCards({
        snsProjects: [
          abortedSnsProject,
          committedSnsProject,
          pendingSnsProject,
        ],
        openSnsProposals: [],
      });

      expect(cards).toEqual([]);
    });

    it("returns all type of cards", () => {
      const openSnsProject1 = createMockSnsFullProject({
        rootCanisterId: principal(1),
        summaryParams: {
          lifecycle: SnsSwapLifecycle.Open,
          swapOpenTimestampSeconds: BigInt(168_000_000),
          projectName: "Project 1",
        },
      });
      const adoptedSnsProject1 = createMockSnsFullProject({
        rootCanisterId: principal(2),
        summaryParams: {
          lifecycle: SnsSwapLifecycle.Adopted,
          swapOpenTimestampSeconds: BigInt(168_000_000),
          projectName: "Project 2",
        },
      });
      const openProposal1: ProposalInfo = {
        ...mockProposalInfo,
        deadlineTimestampSeconds: 168_000_000n,
        topic: Topic.SnsAndCommunityFund,
        status: ProposalStatus.Open,
      };

      const cards = getUpcomingLaunchesCards({
        snsProjects: [openSnsProject1, adoptedSnsProject1],
        openSnsProposals: [openProposal1],
      });

      expect(cards.length).toBe(3);
      expect(cards).toEqual([
        {
          Component: OngoingProjectCard,
          props: { summary: openSnsProject1.summary },
        },
        {
          Component: CreateSnsProposalCard,
          props: { proposalInfo: openProposal1 },
        },
        {
          Component: UpcomingProjectCard,
          props: { summary: adoptedSnsProject1.summary },
        },
      ]);
    });

    it("returns cards in the correct order", () => {
      const openSnsProject1 = createMockSnsFullProject({
        rootCanisterId: principal(1),
        summaryParams: {
          lifecycle: SnsSwapLifecycle.Open,
          swapOpenTimestampSeconds: BigInt(200_000_000),
          projectName: "Project 1",
        },
      });
      const openSnsProject2 = createMockSnsFullProject({
        rootCanisterId: principal(1),
        summaryParams: {
          lifecycle: SnsSwapLifecycle.Open,
          swapOpenTimestampSeconds: BigInt(100_000_000),
          projectName: "Project 2",
        },
      });
      const adoptedSnsProject1 = createMockSnsFullProject({
        rootCanisterId: principal(2),
        summaryParams: {
          lifecycle: SnsSwapLifecycle.Adopted,
          swapOpenTimestampSeconds: BigInt(200_000_000),
          projectName: "Project 2",
        },
      });
      const adoptedSnsProject2 = createMockSnsFullProject({
        rootCanisterId: principal(2),
        summaryParams: {
          lifecycle: SnsSwapLifecycle.Adopted,
          swapOpenTimestampSeconds: BigInt(100_000_000),
          projectName: "Project 3",
        },
      });
      const openProposal1: ProposalInfo = {
        ...mockProposalInfo,
        deadlineTimestampSeconds: 200_000_000n,
        topic: Topic.SnsAndCommunityFund,
        status: ProposalStatus.Open,
      };
      const openProposal2: ProposalInfo = {
        ...mockProposalInfo,
        deadlineTimestampSeconds: 100_000_000n,
        topic: Topic.SnsAndCommunityFund,
        status: ProposalStatus.Open,
      };

      const cards = getUpcomingLaunchesCards({
        snsProjects: [
          adoptedSnsProject1,
          adoptedSnsProject2,
          openSnsProject1,
          openSnsProject2,
        ],
        openSnsProposals: [openProposal1, openProposal2],
      });

      expect(cards.length).toBe(6);
      expect(cards).toEqual([
        {
          Component: OngoingProjectCard,
          props: { summary: openSnsProject2.summary },
        },
        {
          Component: OngoingProjectCard,
          props: { summary: openSnsProject1.summary },
        },
        {
          Component: CreateSnsProposalCard,
          props: { proposalInfo: openProposal2 },
        },
        {
          Component: CreateSnsProposalCard,
          props: { proposalInfo: openProposal1 },
        },
        {
          Component: UpcomingProjectCard,
          props: { summary: adoptedSnsProject2.summary },
        },
        {
          Component: UpcomingProjectCard,
          props: { summary: adoptedSnsProject1.summary },
        },
      ]);
    });
  });

  describe("compareSnsProjectsUndefinedIcpTreasuryLast", () => {
    const projectWithoutMetrics = createMockSnsFullProject({
      rootCanisterId: principal(1),
      summaryParams: {},
      metrics: {
        ...mockSnsMetrics,
        treasury_metrics: undefined,
      },
    });
    const projectWithMetrics = createMockSnsFullProject({
      rootCanisterId: principal(2),
      summaryParams: {},
      metrics: {
        ...mockSnsMetrics,
      },
    });

    it("returns 1 when treasury not available for the `a` project but available for the `b` project", () => {
      expect(
        compareSnsProjectsUndefinedIcpTreasuryLast(
          projectWithoutMetrics,
          projectWithMetrics
        )
      ).toBe(1);
    });

    it("returns -1 when treasury not available for the `b` project", () => {
      expect(
        compareSnsProjectsUndefinedIcpTreasuryLast(
          projectWithMetrics,
          projectWithoutMetrics
        )
      ).toBe(-1);
    });

    it("returns 0 when `a` and `b` have the same treasury availability", () => {
      expect(
        compareSnsProjectsUndefinedIcpTreasuryLast(
          projectWithMetrics,
          projectWithMetrics
        )
      ).toBe(0);
      expect(
        compareSnsProjectsUndefinedIcpTreasuryLast(
          projectWithoutMetrics,
          projectWithoutMetrics
        )
      ).toBe(0);
    });
  });

  describe("compareSnsProjectsUndefinedProposalActivityLast", () => {
    const projectWithoutActivity = createMockSnsFullProject({
      rootCanisterId: principal(1),
      summaryParams: {},
      metrics: undefined,
    });
    const projectWithActivity = createMockSnsFullProject({
      rootCanisterId: principal(2),
      summaryParams: {},
      metrics: {
        ...mockSnsMetrics,
        num_recently_executed_proposals: 20,
      },
    });

    it("returns 1 when activity not available for the `a` project", () => {
      expect(
        compareSnsProjectsUndefinedProposalActivityLast(
          projectWithoutActivity,
          projectWithActivity
        )
      ).toBe(1);
    });

    it("returns -1 when activity not available for the `b` project", () => {
      expect(
        compareSnsProjectsUndefinedProposalActivityLast(
          projectWithActivity,
          projectWithoutActivity
        )
      ).toBe(-1);
    });

    it("returns 0 when `a` and `b` have the same proposal activity availability", () => {
      expect(
        compareSnsProjectsUndefinedProposalActivityLast(
          projectWithActivity,
          projectWithActivity
        )
      ).toBe(0);
      expect(
        compareSnsProjectsUndefinedProposalActivityLast(
          projectWithoutActivity,
          projectWithoutActivity
        )
      ).toBe(0);
    });
  });

  describe("compareSnsProjectsUndefinedMarketCapLast", () => {
    const rootCanisterId1 = principal(1);
    const rootCanisterId2 = principal(2);
    const totalTokenSupply = 25_000_000_000_000n;
    const tokenPrice = 2;
    const ledgerCanisterId1 = principal(3);
    const testProject = createMockSnsFullProject({
      rootCanisterId: rootCanisterId1,
      summaryParams: {
        ledgerCanisterId: ledgerCanisterId1,
      },
    });
    const ledgerCanisterId2 = principal(4);
    const projectWithoutPrice = createMockSnsFullProject({
      rootCanisterId: rootCanisterId2,
      summaryParams: {
        ledgerCanisterId: ledgerCanisterId2,
      },
    });

    beforeEach(() => {
      setSnsProjects([
        {
          rootCanisterId: rootCanisterId1,
          totalTokenSupply,
        },
        {
          rootCanisterId: rootCanisterId2,
          totalTokenSupply,
        },
      ]);
      setIcpSwapUsdPrices({
        [ledgerCanisterId1.toText()]: tokenPrice,
        [ledgerCanisterId2.toText()]: undefined,
      });
    });

    it("returns 1 when prices not available for the `a` project", () => {
      const comparator = compareSnsProjectsUndefinedMarketCapLast({
        icpSwapUsdPricesStore: get(icpSwapUsdPricesStore),
        snsTotalSupplyTokenAmountStore: get(snsTotalSupplyTokenAmountStore),
      });
      expect(comparator(projectWithoutPrice, testProject)).toBe(1);
    });

    it("returns -1 when prices not available for the `b` project", () => {
      const comparator = compareSnsProjectsUndefinedMarketCapLast({
        icpSwapUsdPricesStore: get(icpSwapUsdPricesStore),
        snsTotalSupplyTokenAmountStore: get(snsTotalSupplyTokenAmountStore),
      });
      expect(comparator(testProject, projectWithoutPrice)).toBe(-1);
    });

    it("returns 0 when `a` and `b` have same prices availability", () => {
      const comparator = compareSnsProjectsUndefinedMarketCapLast({
        icpSwapUsdPricesStore: get(icpSwapUsdPricesStore),
        snsTotalSupplyTokenAmountStore: get(snsTotalSupplyTokenAmountStore),
      });
      expect(comparator(testProject, testProject)).toBe(0);
      expect(comparator(projectWithoutPrice, projectWithoutPrice)).toBe(0);
    });
  });

  describe("compareSnsProjectsByProposalActivity", () => {
    const projectWith5Proposals = createMockSnsFullProject({
      rootCanisterId: principal(1),
      summaryParams: {},
      metrics: {
        ...mockSnsMetrics,
        num_recently_executed_proposals: 5,
      },
    });
    const projectWith22Proposals = createMockSnsFullProject({
      rootCanisterId: principal(2),
      summaryParams: {},
      metrics: {
        ...mockSnsMetrics,
        num_recently_executed_proposals: 22,
      },
    });

    it("returns 1 when the `a` project has more activity", () => {
      expect(
        compareSnsProjectsByProposalActivity(
          projectWith5Proposals,
          projectWith22Proposals
        )
      ).toBe(1);
    });

    it("returns -1 when the `b` project has more activity", () => {
      expect(
        compareSnsProjectsByProposalActivity(
          projectWith22Proposals,
          projectWith5Proposals
        )
      ).toBe(-1);
    });

    it("returns 0 when `a` and `b` have same activity", () => {
      expect(
        compareSnsProjectsByProposalActivity(
          projectWith22Proposals,
          projectWith22Proposals
        )
      ).toBe(0);
      expect(
        compareSnsProjectsByProposalActivity(
          projectWith5Proposals,
          projectWith5Proposals
        )
      ).toBe(0);
    });
  });

  describe("compareSnsProjectsByMarketCap", () => {
    const rootCanisterId1 = principal(1);
    const rootCanisterId2 = principal(2);
    const totalTokenSupply1 = 1_000_000_000_000n;
    const totalTokenSupply2 = 2_000_000_000_000n;
    const tokenPrice = 2;
    const ledgerCanisterId1 = principal(3);
    // totalTokenSupply1 * tokenPrice
    const projectWithSmallMarketCap = createMockSnsFullProject({
      rootCanisterId: rootCanisterId1,
      summaryParams: {
        ledgerCanisterId: ledgerCanisterId1,
      },
    });
    const ledgerCanisterId2 = principal(4);
    // totalTokenSupply2 * tokenPrice
    const projectWithBigMarketCap = createMockSnsFullProject({
      rootCanisterId: rootCanisterId2,
      summaryParams: {
        ledgerCanisterId: ledgerCanisterId2,
      },
    });

    beforeEach(() => {
      setSnsProjects([
        {
          rootCanisterId: rootCanisterId1,
          totalTokenSupply: totalTokenSupply1,
        },
        {
          rootCanisterId: rootCanisterId2,
          totalTokenSupply: totalTokenSupply2,
        },
      ]);
      setIcpSwapUsdPrices({
        [ledgerCanisterId1.toText()]: tokenPrice,
        [ledgerCanisterId2.toText()]: tokenPrice,
      });
    });

    it("Returns 1 if `a` has a smaller market cap than `b`", () => {
      const comparator = compareSnsProjectsByMarketCap({
        icpSwapUsdPricesStore: get(icpSwapUsdPricesStore),
        snsTotalSupplyTokenAmountStore: get(snsTotalSupplyTokenAmountStore),
      });
      expect(
        comparator(projectWithSmallMarketCap, projectWithBigMarketCap)
      ).toBe(1);
    });

    it("Returns -1 if `a` has a larger market cap than `b`", () => {
      const comparator = compareSnsProjectsByMarketCap({
        icpSwapUsdPricesStore: get(icpSwapUsdPricesStore),
        snsTotalSupplyTokenAmountStore: get(snsTotalSupplyTokenAmountStore),
      });
      expect(
        comparator(projectWithBigMarketCap, projectWithSmallMarketCap)
      ).toBe(-1);
    });

    it("Returns 0 if `a` has the same market cap as `b`", () => {
      const comparator = compareSnsProjectsByMarketCap({
        icpSwapUsdPricesStore: get(icpSwapUsdPricesStore),
        snsTotalSupplyTokenAmountStore: get(snsTotalSupplyTokenAmountStore),
      });
      expect(
        comparator(projectWithSmallMarketCap, projectWithSmallMarketCap)
      ).toBe(0);
      expect(comparator(projectWithBigMarketCap, projectWithBigMarketCap)).toBe(
        0
      );
    });
  });
});

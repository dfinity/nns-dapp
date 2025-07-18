import CreateSnsProposalCard from "$lib/components/launchpad/CreateSnsProposalCard.svelte";
import OngoingProjectCard from "$lib/components/launchpad/OngoingProjectCard.svelte";
import UpcomingProjectCard from "$lib/components/launchpad/UpcomingProjectCard.svelte";
import { getUpcomingLaunchesCards } from "$lib/utils/launchpad.utils";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import {
  createMockSnsFullProject,
  principal,
} from "$tests/mocks/sns-projects.mock";
import { ProposalStatus, Topic, type ProposalInfo } from "@dfinity/nns";
import { SnsSwapLifecycle } from "@dfinity/sns";

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
});

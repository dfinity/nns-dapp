import AdoptedProposalCard from "$lib/components/portfolio/AdoptedProposalCard.svelte";
import LaunchProjectCard from "$lib/components/portfolio/LaunchProjectCard.svelte";
import NewSnsProposalCard from "$lib/components/portfolio/NewSnsProposalCard.svelte";
import {
  getLaunchedSnsProjectCards,
  getUpcomingLaunchesCards,
} from "$lib/utils/launchpad.utils";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import {
  createMockSnsFullProject,
  principal,
} from "$tests/mocks/sns-projects.mock";
import { ProposalStatus, Topic, type ProposalInfo } from "@dfinity/nns";
import { SnsSwapLifecycle } from "@dfinity/sns";
import ProjectCard from "../../../lib/components/launchpad/ProjectCard.svelte";

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
          Component: LaunchProjectCard,
          props: { summary: openSnsProject1.summary },
        },
        {
          Component: NewSnsProposalCard,
          props: { proposalInfo: openProposal1 },
        },
        {
          Component: AdoptedProposalCard,
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
          Component: LaunchProjectCard,
          props: { summary: openSnsProject2.summary },
        },
        {
          Component: LaunchProjectCard,
          props: { summary: openSnsProject1.summary },
        },
        {
          Component: NewSnsProposalCard,
          props: { proposalInfo: openProposal2 },
        },
        {
          Component: NewSnsProposalCard,
          props: { proposalInfo: openProposal1 },
        },
        {
          Component: AdoptedProposalCard,
          props: { summary: adoptedSnsProject2.summary },
        },
        {
          Component: AdoptedProposalCard,
          props: { summary: adoptedSnsProject1.summary },
        },
      ]);
    });
  });

  describe("getLaunchedSnsProjectCards", () => {
    it('returns only "Committed" projects', () => {
      const abortedSnsProject = createMockSnsFullProject({
        rootCanisterId: principal(1),
        summaryParams: {
          lifecycle: SnsSwapLifecycle.Aborted,
        },
      });
      const adoptedSnsProject = createMockSnsFullProject({
        rootCanisterId: principal(2),
        summaryParams: {
          lifecycle: SnsSwapLifecycle.Adopted,
        },
      });
      const committedSnsProject = createMockSnsFullProject({
        rootCanisterId: principal(2),
        summaryParams: {
          lifecycle: SnsSwapLifecycle.Committed,
        },
      });
      const openSnsProject = createMockSnsFullProject({
        rootCanisterId: principal(2),
        summaryParams: {
          lifecycle: SnsSwapLifecycle.Open,
        },
      });
      const pendingSnsProject = createMockSnsFullProject({
        rootCanisterId: principal(3),
        summaryParams: {
          lifecycle: SnsSwapLifecycle.Pending,
        },
      });
      const cards = getLaunchedSnsProjectCards([
        abortedSnsProject,
        adoptedSnsProject,
        openSnsProject,
        committedSnsProject,
        pendingSnsProject,
      ]);

      expect(cards).toEqual([
        {
          Component: ProjectCard,
          props: { project: committedSnsProject },
        },
      ]);
    });

    it("returns cards with user committed projects first", () => {
      const project1 = createMockSnsFullProject({
        rootCanisterId: principal(2),
        summaryParams: {
          lifecycle: SnsSwapLifecycle.Committed,
        },
      });
      const project2 = createMockSnsFullProject({
        rootCanisterId: principal(2),
        summaryParams: {
          lifecycle: SnsSwapLifecycle.Committed,
        },
        icpCommitment: 10n,
      });
      const project3 = createMockSnsFullProject({
        rootCanisterId: principal(2),
        summaryParams: {
          lifecycle: SnsSwapLifecycle.Committed,
        },
        icpCommitment: 0n,
      });
      const project4 = createMockSnsFullProject({
        rootCanisterId: principal(2),
        summaryParams: {
          lifecycle: SnsSwapLifecycle.Committed,
        },
        icpCommitment: 10n,
      });

      const cards = getLaunchedSnsProjectCards([
        project1,
        project2,
        project3,
        project4,
      ]);

      expect(cards).toEqual([
        {
          Component: ProjectCard,
          props: { project: project2 },
        },
        {
          Component: ProjectCard,
          props: { project: project4 },
        },
        {
          Component: ProjectCard,
          props: { project: project1 },
        },
        {
          Component: ProjectCard,
          props: { project: project3 },
        },
      ]);
    });
  });
});

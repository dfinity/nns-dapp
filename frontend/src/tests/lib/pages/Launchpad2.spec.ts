import { FEATURED_SNS_PROJECTS } from "$lib/constants/sns.constants";
import type { SnsFullProject } from "$lib/derived/sns/sns-projects.derived";
import Launchpad2 from "$lib/pages/Launchpad2.svelte";
import {
  createMockProposalActionCreateServiceNervousSystem,
  createMockProposalInfo,
} from "$tests/mocks/proposal.mock";
import {
  createMockSnsFullProject,
  mockSnsMetrics,
  principal,
} from "$tests/mocks/sns-projects.mock";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { Launchpad2Po } from "$tests/page-objects/Launchpad2.page-object";
import { type ProposalInfo } from "@dfinity/nns";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { Principal } from "@icp-sdk/core/principal";
import { render } from "@testing-library/svelte";

describe("Launchpad2", () => {
  const renderComponent = (props: {
    snsProjects: SnsFullProject[];
    openSnsProposals: ProposalInfo[];
    isLoading?: boolean;
  }) => {
    const { container } = render(Launchpad2, {
      props: {
        ...props,
        isLoading: props.isLoading ?? false,
      },
    });
    return Launchpad2Po.under(new JestPageObjectElement(container));
  };

  it("doesn't display cards if no data available", async () => {
    const po = renderComponent({
      snsProjects: [],
      openSnsProposals: [],
      isLoading: true,
    });

    expect(await po.getUpcomingLaunchesCardListPo().isPresent()).toBe(false);
    expect(await po.getFeaturedProjectsCardListPo().isPresent()).toBe(false);
    expect(await po.getSkeletonProjectsCardListPo().isPresent()).toBe(true);
  });

  it("displays upcoming launch cards", async () => {
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
    const openProposal1: ProposalInfo = createMockProposalInfo({
      action: createMockProposalActionCreateServiceNervousSystem({
        name: "SNS Proposal Title",
      }),
    });

    const po = renderComponent({
      snsProjects: [openSnsProject1, adoptedSnsProject1],
      openSnsProposals: [openProposal1],
    });

    const upcomingLaunchesCards = po.getUpcomingLaunchesCardListPo();
    const upcomingLaunchesCardsEntryPos =
      await upcomingLaunchesCards.getCardEntries();

    expect(await po.getSkeletonProjectsCardListPo().isPresent()).toBe(false);
    expect(await upcomingLaunchesCards.isPresent()).toBe(true);
    expect(upcomingLaunchesCardsEntryPos.length).toBe(3);

    expect(await upcomingLaunchesCardsEntryPos[0].getCardTitle()).toEqual(
      "Project 1"
    );
    expect(await upcomingLaunchesCardsEntryPos[1].getCardTitle()).toEqual(
      "SNS Proposal Title"
    );
    expect(await upcomingLaunchesCardsEntryPos[2].getCardTitle()).toEqual(
      "Project 2"
    );
  });

  it("displays featured projects cards in correct order", async () => {
    const project0 = createMockSnsFullProject({
      rootCanisterId: Principal.fromText(FEATURED_SNS_PROJECTS[0]),
      summaryParams: {
        lifecycle: SnsSwapLifecycle.Committed,
        swapOpenTimestampSeconds: BigInt(168_000_000),
        projectName: "Outdated Featured Project",
      },
      metrics: undefined,
    });
    const project1 = createMockSnsFullProject({
      rootCanisterId: Principal.fromText(FEATURED_SNS_PROJECTS[1]),
      summaryParams: {
        lifecycle: SnsSwapLifecycle.Committed,
        swapOpenTimestampSeconds: BigInt(168_000_000),
        projectName: "Not Committed, Not Active Featured Project",
      },
      metrics: {
        ...mockSnsMetrics,
        num_recently_executed_proposals: 0,
      },
    });
    const project2 = createMockSnsFullProject({
      rootCanisterId: Principal.fromText(FEATURED_SNS_PROJECTS[2]),
      summaryParams: {
        lifecycle: SnsSwapLifecycle.Committed,
        swapOpenTimestampSeconds: BigInt(168_000_000),
        projectName: "Not Committed, Very Active Featured Project",
      },
      metrics: {
        ...mockSnsMetrics,
        num_recently_executed_proposals: 22,
      },
    });
    const project3 = createMockSnsFullProject({
      rootCanisterId: Principal.fromText(FEATURED_SNS_PROJECTS[3]),
      summaryParams: {
        lifecycle: SnsSwapLifecycle.Committed,
        swapOpenTimestampSeconds: BigInt(168_000_000),
        projectName: "Committed, Not Active Featured Project",
      },
      icpCommitment: 10_000_000n,
      metrics: {
        ...mockSnsMetrics,
        num_recently_executed_proposals: 0,
      },
    });
    const project4 = createMockSnsFullProject({
      rootCanisterId: Principal.fromText(FEATURED_SNS_PROJECTS[4]),
      summaryParams: {
        lifecycle: SnsSwapLifecycle.Committed,
        swapOpenTimestampSeconds: BigInt(168_000_000),
        projectName: "Committed, Very Active Featured Project",
      },
      icpCommitment: 10_000_000n,
      metrics: {
        ...mockSnsMetrics,
        num_recently_executed_proposals: 22,
      },
    });
    const project5 = createMockSnsFullProject({
      rootCanisterId: Principal.fromText(FEATURED_SNS_PROJECTS[5]),
      summaryParams: {
        lifecycle: SnsSwapLifecycle.Committed,
        swapOpenTimestampSeconds: BigInt(168_000_000),
        projectName: "Committed, Extremely Active Featured Project",
      },
      icpCommitment: 10_000_000n,
      metrics: {
        ...mockSnsMetrics,
        num_recently_executed_proposals: 100,
      },
    });
    const notFeaturedProject = createMockSnsFullProject({
      rootCanisterId: principal(0),
      summaryParams: {
        lifecycle: SnsSwapLifecycle.Committed,
        swapOpenTimestampSeconds: BigInt(168_000_000),
        projectName: "Not Featured Project",
      },
      icpCommitment: 10_000_000n,
      metrics: {
        ...mockSnsMetrics,
        num_recently_executed_proposals: 100,
      },
    });

    const po = renderComponent({
      snsProjects: [
        project0,
        project1,
        project2,
        project3,
        project4,
        project5,
        notFeaturedProject,
      ],
      openSnsProposals: [],
    });

    const featuredProjectCards = po.getFeaturedProjectsCardListPo();
    const cardsEntryPos = await featuredProjectCards.getCardEntries();

    expect(await featuredProjectCards.isPresent()).toBe(true);
    expect(cardsEntryPos.length).toBe(6);
    const launchedProjectsCardsTitles = await Promise.all(
      cardsEntryPos.map((card) => card.getCardTitle())
    );
    expect(launchedProjectsCardsTitles).not.toContain("Not Featured Project");
    expect(launchedProjectsCardsTitles).toEqual([
      "Committed, Extremely Active Featured Project",
      "Not Committed, Very Active Featured Project",
      "Committed, Very Active Featured Project",
      "Not Committed, Not Active Featured Project",
      "Committed, Not Active Featured Project",
      "Outdated Featured Project",
    ]);
  });

  it("displays launched cards in correct order", async () => {
    const project0 = createMockSnsFullProject({
      rootCanisterId: principal(1),
      summaryParams: {
        lifecycle: SnsSwapLifecycle.Committed,
        swapOpenTimestampSeconds: BigInt(168_000_000),
        projectName: "Outdated Project",
      },
      metrics: undefined,
    });
    const project1 = createMockSnsFullProject({
      rootCanisterId: principal(1),
      summaryParams: {
        lifecycle: SnsSwapLifecycle.Committed,
        swapOpenTimestampSeconds: BigInt(168_000_000),
        projectName: "Not Committed, Not Active Project",
      },
      metrics: {
        ...mockSnsMetrics,
        num_recently_executed_proposals: 0,
      },
    });
    const project12 = createMockSnsFullProject({
      rootCanisterId: principal(1),
      summaryParams: {
        lifecycle: SnsSwapLifecycle.Committed,
        swapOpenTimestampSeconds: BigInt(168_000_000),
        projectName: "Not Committed, Very Active Project",
      },
      metrics: {
        ...mockSnsMetrics,
        num_recently_executed_proposals: 22,
      },
    });
    const project3 = createMockSnsFullProject({
      rootCanisterId: principal(1),
      summaryParams: {
        lifecycle: SnsSwapLifecycle.Committed,
        swapOpenTimestampSeconds: BigInt(168_000_000),
        projectName: "Committed, Not Active Project",
      },
      icpCommitment: 10_000_000n,
      metrics: {
        ...mockSnsMetrics,
        num_recently_executed_proposals: 0,
      },
    });
    const project4 = createMockSnsFullProject({
      rootCanisterId: principal(1),
      summaryParams: {
        lifecycle: SnsSwapLifecycle.Committed,
        swapOpenTimestampSeconds: BigInt(168_000_000),
        projectName: "Committed, Very Active Project",
      },
      icpCommitment: 10_000_000n,
      metrics: {
        ...mockSnsMetrics,
        num_recently_executed_proposals: 22,
      },
    });
    const featuredProject = createMockSnsFullProject({
      rootCanisterId: Principal.fromText(FEATURED_SNS_PROJECTS[0]),
      summaryParams: {
        lifecycle: SnsSwapLifecycle.Committed,
        swapOpenTimestampSeconds: BigInt(168_000_000),
        projectName: "Featured Project",
      },
      icpCommitment: 10_000_000n,
      metrics: {
        ...mockSnsMetrics,
        num_recently_executed_proposals: 22,
      },
    });

    const po = renderComponent({
      snsProjects: [
        project0,
        project1,
        project12,
        project3,
        project4,
        featuredProject,
      ],
      openSnsProposals: [],
    });

    const featuredProjectCards = po.getFeaturedProjectsCardListPo();
    expect(await featuredProjectCards.getCardEntries()).toHaveLength(1);

    const restProjectCards = po.getRestProjectsCardListPo();
    const cardsEntryPos = await restProjectCards.getCardEntries();

    expect(await restProjectCards.isPresent()).toBe(true);
    expect(cardsEntryPos.length).toBe(5);
    const launchedProjectsCardsTitles = await Promise.all(
      cardsEntryPos.map((card) => card.getCardTitle())
    );

    expect(launchedProjectsCardsTitles).not.toContain("Featured Project");
    expect(launchedProjectsCardsTitles).toEqual([
      "Not Committed, Very Active Project",
      "Committed, Very Active Project",
      "Not Committed, Not Active Project",
      "Committed, Not Active Project",
      "Outdated Project",
    ]);
  });
});

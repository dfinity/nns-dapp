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
    expect(await po.getLaunchedProjectsCardListPo().isPresent()).toBe(false);
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

    const po = renderComponent({
      snsProjects: [project0, project1, project12, project3, project4],
      openSnsProposals: [],
    });

    const launchedProjectsCards = po.getLaunchedProjectsCardListPo();
    const launchedProjectsCardsEntryPos =
      await launchedProjectsCards.getCardEntries();

    expect(await launchedProjectsCards.isPresent()).toBe(true);
    expect(launchedProjectsCardsEntryPos.length).toBe(5);
    const launchedProjectsCardsTitles = await Promise.all(
      launchedProjectsCardsEntryPos.map((card) => card.getCardTitle())
    );

    expect(launchedProjectsCardsTitles).toEqual([
      "Committed, Very Active Project",
      "Committed, Not Active Project",
      "Not Committed, Very Active Project",
      "Not Committed, Not Active Project",
      "Outdated Project",
    ]);
  });
});

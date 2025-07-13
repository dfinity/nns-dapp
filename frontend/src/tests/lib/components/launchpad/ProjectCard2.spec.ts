import * as saleApi from "$lib/api/sns-sale.api";
import ProjectCard2 from "$lib/components/launchpad/ProjectCard2.svelte";
import { SECONDS_IN_DAY } from "$lib/constants/constants";
import type { SnsFullProject } from "$lib/derived/sns/sns-projects.derived";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { createFinalizationStatusMock } from "$tests/mocks/sns-finalization-status.mock";
import {
  createMockSnsFullProject,
  mockSnsFullProject,
  mockSnsMetrics,
} from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { ProjectCard2Po } from "$tests/page-objects/ProjectCard2.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setIcpSwapUsdPrices } from "$tests/utils/icp-swap.test-utils";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

vi.mock("$lib/api/sns-sale.api");

const blockedApiPaths = ["$lib/api/sns-sale.api"];

describe("ProjectCard2", () => {
  blockAllCallsTo(blockedApiPaths);

  const rootCanisterId = rootCanisterIdMock;
  const now = 1698139468000;
  const nowInSeconds = Math.round(now / 1000);
  const yesterdayInSeconds = nowInSeconds - SECONDS_IN_DAY;

  beforeEach(() => {
    vi.useFakeTimers().setSystemTime(now);
    vi.spyOn(saleApi, "queryFinalizationStatus").mockResolvedValue(
      createFinalizationStatusMock(false)
    );
    setSnsProjects([
      {
        rootCanisterId: mockSnsFullProject.rootCanisterId,
        lifecycle: SnsSwapLifecycle.Committed,
        swapDueTimestampSeconds: yesterdayInSeconds,
      },
    ]);
  });

  const renderCard = async (project: SnsFullProject) => {
    const { container } = render(ProjectCard2, {
      props: {
        project,
      },
    });

    await runResolvedPromises();

    return ProjectCard2Po.under(new JestPageObjectElement(container));
  };

  describe("signed in", () => {
    beforeEach(() => {
      resetIdentity();
    });

    it("should render a logo", async () => {
      const po = await renderCard(mockSnsFullProject);

      expect(await po.getLogoSrc()).toBe(
        mockSnsFullProject.summary.metadata.logo
      );
    });

    it("should render a title", async () => {
      const po = await renderCard(mockSnsFullProject);

      expect(await po.getTitle()).toBe(
        mockSnsFullProject.summary.metadata.name
      );
    });

    it("should render a description", async () => {
      const po = await renderCard(mockSnsFullProject);

      expect(await po.getDescription()).toBe(
        mockSnsFullProject.summary.metadata.description
      );
    });

    it("should render a link to the project", async () => {
      const po = await renderCard(mockSnsFullProject);

      expect(await po.getProjectLinkPo().getHref()).toBe(
        `/project/?project=${mockSnsFullProject.rootCanisterId}`
      );
    });

    it("should be highlighted if user committed", async () => {
      const project = createMockSnsFullProject({
        rootCanisterId,
        summaryParams: {
          lifecycle: SnsSwapLifecycle.Open,
        },
        icpCommitment: 100_000_000n,
      });

      const po = await renderCard(project);

      expect(await po.isHighlighted()).toBe(true);
    });

    it("should not be highlighted without commitment", async () => {
      const project = createMockSnsFullProject({
        rootCanisterId,
        summaryParams: {
          lifecycle: SnsSwapLifecycle.Open,
        },
        icpCommitment: undefined,
      });
      const po = await renderCard(project);

      expect(await po.isHighlighted()).toBe(false);
    });

    it("should display token price", async () => {
      const project = createMockSnsFullProject({
        rootCanisterId,
        summaryParams: {
          lifecycle: SnsSwapLifecycle.Open,
          swapDueTimestampSeconds: BigInt(nowInSeconds + SECONDS_IN_DAY),
        },
      });
      const ledgerCanisterId = project.summary.ledgerCanisterId;
      setIcpSwapUsdPrices({
        [ledgerCanisterId.toText()]: 15,
      });

      const po = await renderCard(project);

      expect(await po.getTokenPriceValue()).toEqual("$15.00");
    });

    it("should display user commitment if any", async () => {
      const project = createMockSnsFullProject({
        rootCanisterId,
        summaryParams: {
          lifecycle: SnsSwapLifecycle.Open,
          swapDueTimestampSeconds: BigInt(nowInSeconds + SECONDS_IN_DAY),
        },
        icpCommitment: 314000000n,
      });

      const po = await renderCard(project);

      expect(await po.getProposalActivity().isPresent()).toBe(false);
      expect(await po.getUserCommitmentIcp().isPresent()).toBe(true);
      expect(await po.getUserCommitmentIcp().getAmount()).toBe("3.14");
    });

    it("should display proposal activity if no commitment", async () => {
      const weeksInTwoMonths = (30 * 2) / 7;
      const executedProposalsPerWeek = 10;
      const executedProposalsIn2Months = Math.round(
        weeksInTwoMonths * executedProposalsPerWeek
      );
      const project = createMockSnsFullProject({
        rootCanisterId,
        summaryParams: {
          lifecycle: SnsSwapLifecycle.Open,
        },
        icpCommitment: undefined,
        metrics: {
          ...mockSnsMetrics,
          num_recently_executed_proposals: executedProposalsIn2Months,
        },
      });
      const po = await renderCard(project);

      expect(await po.getUserCommitmentIcp().isPresent()).toBe(false);
      expect(await po.getProposalActivity().isPresent()).toBe(true);
      expect(await po.getProposalActivityValueText()).toEqual(
        executedProposalsPerWeek
      );
      expect(await po.getProposalActivityNotAvailable().isPresent()).toBe(
        false
      );
    });

    it("should display N/A for proposal activity when no metrics", async () => {
      const project = createMockSnsFullProject({
        rootCanisterId,
        summaryParams: {
          lifecycle: SnsSwapLifecycle.Open,
        },
        icpCommitment: undefined,
        metrics: undefined,
      });
      const po = await renderCard(project);

      expect(await po.getUserCommitmentIcp().isPresent()).toBe(false);
      expect(await po.getProposalActivity().isPresent()).toBe(true);
      expect(await po.getProposalActivityValue().isPresent()).toBe(false);
      expect(await po.getProposalActivityNotAvailable().isPresent()).toBe(true);
    });

    it("should display ICP in treasury", async () => {
      const project = createMockSnsFullProject({
        rootCanisterId,
        summaryParams: {
          lifecycle: SnsSwapLifecycle.Open,
        },
        icpCommitment: undefined,
      });
      const po = await renderCard(project);

      // TODO(launchpad2): Update this test when ICP in treasury is implemented.
      expect(await po.getIcpInTreasuryValue()).toEqual("-/-%");
    });
  });
});

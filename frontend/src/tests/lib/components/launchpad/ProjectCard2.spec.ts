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
import { SnsSwapLifecycle } from "@icp-sdk/canisters/sns";
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

    it("should display participated mark when user has participated", async () => {
      const project = createMockSnsFullProject({
        rootCanisterId,
        summaryParams: {
          lifecycle: SnsSwapLifecycle.Open,
        },
        icpCommitment: 100_000_000n,
      });

      const po = await renderCard(project);

      expect(await po.getParticipatedIcon().isPresent()).toBe(true);
    });

    it("should not display participated mark when user has not participated", async () => {
      const project = createMockSnsFullProject({
        rootCanisterId,
        summaryParams: {
          lifecycle: SnsSwapLifecycle.Open,
        },
        icpCommitment: undefined,
      });
      const po = await renderCard(project);

      expect(await po.getParticipatedIcon().isPresent()).toBe(false);
    });

    it("should display fully diluted valuation", async () => {
      const totalTokenSupply = 25_000_000_000_000n;
      const tokenPrice = 2;
      setSnsProjects([
        {
          rootCanisterId: mockSnsFullProject.rootCanisterId,
          lifecycle: SnsSwapLifecycle.Committed,
          totalTokenSupply,
        },
      ]);
      const project = createMockSnsFullProject({
        rootCanisterId,
        summaryParams: {
          lifecycle: SnsSwapLifecycle.Open,
          swapDueTimestampSeconds: BigInt(nowInSeconds + SECONDS_IN_DAY),
        },
      });
      const ledgerCanisterId = project.summary.ledgerCanisterId;
      setIcpSwapUsdPrices({
        [ledgerCanisterId.toText()]: tokenPrice,
      });

      const po = await renderCard(project);

      // totalTokenSupply / 10**8 * tokenPrice
      // 25_000_000_000_000 / 10**8 * 2 = 500_000
      expect(await po.getMarketCapValue()).toEqual("$500k");
    });

    it("should display '-' for fully diluted valuation when price is not available", async () => {
      const totalTokenSupply = 25_000_000_000_000n;
      const tokenPrice = undefined;
      setSnsProjects([
        {
          rootCanisterId: mockSnsFullProject.rootCanisterId,
          lifecycle: SnsSwapLifecycle.Committed,
          totalTokenSupply,
        },
      ]);
      const project = createMockSnsFullProject({
        rootCanisterId,
        summaryParams: {
          lifecycle: SnsSwapLifecycle.Open,
          swapDueTimestampSeconds: BigInt(nowInSeconds + SECONDS_IN_DAY),
        },
      });
      const ledgerCanisterId = project.summary.ledgerCanisterId;
      setIcpSwapUsdPrices({
        [ledgerCanisterId.toText()]: tokenPrice,
      });

      const po = await renderCard(project);

      expect(await po.getMarketCapValue()).toEqual("$-/-");
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

      expect(await po.getProposalActivity().isPresent()).toBe(true);
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
        `${executedProposalsPerWeek}`
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
  });
});

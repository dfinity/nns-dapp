import * as saleApi from "$lib/api/sns-sale.api";
import ProjectCard from "$lib/components/launchpad/ProjectCard.svelte";
import { SECONDS_IN_DAY, SECONDS_IN_MONTH } from "$lib/constants/constants";
import type { SnsFullProject } from "$lib/derived/sns/sns-projects.derived";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { createFinalizationStatusMock } from "$tests/mocks/sns-finalization-status.mock";
import {
  createMockSnsFullProject,
  mockSnsFullProject,
} from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { ProjectCardPo } from "$tests/page-objects/ProjectCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("ProjectCard", () => {
  const rootCanisterId = rootCanisterIdMock;
  const now = 1698139468000;
  const nowInSeconds = Math.round(now / 1000);
  const yesterdayInSeconds = nowInSeconds - SECONDS_IN_DAY;
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers().setSystemTime(now);
    setSnsProjects([
      {
        rootCanisterId: mockSnsFullProject.rootCanisterId,
        lifecycle: SnsSwapLifecycle.Committed,
        swapDueTimestampSeconds: yesterdayInSeconds,
      },
    ]);
  });

  const renderCard = async (project: SnsFullProject) => {
    const { container } = render(ProjectCard, {
      props: {
        project,
      },
    });

    await runResolvedPromises();

    return ProjectCardPo.under(new JestPageObjectElement(container));
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

      expect(await po.getProjectName()).toBe(
        mockSnsFullProject.summary.metadata.name
      );
    });

    it("should render a description", async () => {
      const po = await renderCard(mockSnsFullProject);

      expect(await po.getDescription()).toBe(
        mockSnsFullProject.summary.metadata.description
      );
    });

    it("should be highlighted with user commitment", async () => {
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

    it("should display a spinner when the swapCommitment is not loaded", async () => {
      const po = await renderCard({
        ...mockSnsFullProject,
        swapCommitment: undefined,
      });

      expect(await po.hasSpinner()).toBe(true);
    });

    it("should render swap info", async () => {
      const project = createMockSnsFullProject({
        rootCanisterId,
        summaryParams: {
          lifecycle: SnsSwapLifecycle.Open,
          swapDueTimestampSeconds: BigInt(nowInSeconds + SECONDS_IN_DAY),
        },
        icpCommitment: 314000000n,
      });

      const po = await renderCard(project);

      expect(await po.getUserCommitment()).toBe("3.14 ICP");
      expect(await po.getDeadline()).toBe("1 day");
    });

    it("should render complete status if swap is Committed", async () => {
      const oneMonthAgoInSeconds = nowInSeconds - SECONDS_IN_MONTH;
      const snsFulProject = createMockSnsFullProject({
        rootCanisterId: rootCanisterIdMock,
        summaryParams: {
          lifecycle: SnsSwapLifecycle.Committed,
          swapDueTimestampSeconds: BigInt(oneMonthAgoInSeconds),
        },
      });

      const po = await renderCard(snsFulProject);

      expect(await po.getStatus()).toBe("Status Completed");
    });

    it("should render finalizing status if swap is finalizing", async () => {
      vi.spyOn(saleApi, "queryFinalizationStatus").mockResolvedValue(
        createFinalizationStatusMock(true)
      );
      const snsFulProject = createMockSnsFullProject({
        rootCanisterId: rootCanisterIdMock,
        summaryParams: {
          lifecycle: SnsSwapLifecycle.Committed,
          swapDueTimestampSeconds: BigInt(yesterdayInSeconds),
        },
      });

      const po = await renderCard(snsFulProject);

      expect(await po.getStatus()).toBe("Status Finalizing");
    });
  });

  describe("not signed in", () => {
    beforeAll(() => {
      setNoIdentity();
    });

    it("should not display a spinner when the swapCommitment is not loaded", async () => {
      const po = await renderCard({
        ...mockSnsFullProject,
        swapCommitment: undefined,
      });

      expect(await po.hasSpinner()).toBe(false);
    });
  });
});

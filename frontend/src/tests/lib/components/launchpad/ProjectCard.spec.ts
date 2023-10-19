import * as saleApi from "$lib/api/sns-sale.api";
import ProjectCard from "$lib/components/launchpad/ProjectCard.svelte";
import { SECONDS_IN_DAY, SECONDS_IN_MONTH } from "$lib/constants/constants";
import { authStore } from "$lib/stores/auth.store";
import {
  authStoreMock,
  mockIdentity,
  mutableMockAuthStoreSubscribe,
} from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
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
  vitest
    .spyOn(authStore, "subscribe")
    .mockImplementation(mutableMockAuthStoreSubscribe);

  const now = Date.now();
  const nowInSeconds = Math.floor(now / 1000);
  const yesterdayInSeconds = nowInSeconds - SECONDS_IN_DAY;
  beforeEach(() => {
    vi.clearAllMocks();
    setSnsProjects([
      {
        rootCanisterId: mockSnsFullProject.rootCanisterId,
        lifecycle: SnsSwapLifecycle.Committed,
        swapDueTimestampSeconds: yesterdayInSeconds,
      },
    ]);
  });

  describe("signed in", () => {
    beforeAll(() =>
      authStoreMock.next({
        identity: mockIdentity,
      })
    );

    it("should render a logo", () => {
      const { container } = render(ProjectCard, {
        props: {
          project: mockSnsFullProject,
        },
      });

      const img = container.querySelector("img");

      expect(img).toBeInTheDocument();
      expect(img?.getAttribute("src")).toBe(
        mockSnsFullProject.summary.metadata.logo
      );
    });

    it("should render a title", async () => {
      const { container } = render(ProjectCard, {
        props: {
          project: mockSnsFullProject,
        },
      });

      const po = ProjectCardPo.under(new JestPageObjectElement(container));

      expect(await po.getProjectName()).toBe(
        mockSnsFullProject.summary.metadata.name
      );
    });

    it("should render a description", () => {
      const { getByText } = render(ProjectCard, {
        props: {
          project: mockSnsFullProject,
        },
      });

      expect(
        getByText(mockSnsFullProject.summary.metadata.description)
      ).toBeInTheDocument();
    });

    it("should be highlighted", async () => {
      const { container } = render(ProjectCard, {
        props: {
          project: {
            ...mockSnsFullProject,
            swapCommitment: {
              rootCanisterId: mockSnsFullProject.rootCanisterId,
              myCommitment: {
                icp: [
                  {
                    transfer_start_timestamp_seconds: BigInt(123132),
                    amount_e8s: BigInt(100_000_000),
                    transfer_success_timestamp_seconds: BigInt(5443554),
                  },
                ],
                has_created_neuron_recipes: [],
              },
            },
          },
        },
      });

      const po = ProjectCardPo.under(new JestPageObjectElement(container));

      expect(await po.isHighlighted()).toBe(true);
    });

    it("should not be highlighted without commitment", async () => {
      const { container } = render(ProjectCard, {
        props: {
          project: {
            ...mockSnsFullProject,
            swapCommitment: {
              rootCanisterId: mockSnsFullProject.rootCanisterId,
              myCommitment: undefined,
            },
          },
        },
      });

      const po = ProjectCardPo.under(new JestPageObjectElement(container));

      expect(await po.isHighlighted()).toBe(false);
    });

    it("should display a spinner when the swapCommitment is not loaded", () => {
      const { getByTestId } = render(ProjectCard, {
        props: {
          project: { ...mockSnsFullProject, swapCommitment: undefined },
        },
      });

      expect(getByTestId("spinner")).toBeInTheDocument();
    });

    it("should render swap info", () => {
      const { getByText } = render(ProjectCard, {
        props: {
          project: mockSnsFullProject,
        },
      });

      expect(getByText(en.sns_project_detail.deadline)).toBeInTheDocument();
      expect(
        getByText(en.sns_project_detail.user_current_commitment)
      ).toBeInTheDocument();
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

      const { container } = render(ProjectCard, {
        props: {
          project: snsFulProject,
        },
      });

      const po = ProjectCardPo.under(new JestPageObjectElement(container));
      await runResolvedPromises();

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

      const { container } = render(ProjectCard, {
        props: {
          project: snsFulProject,
        },
      });

      const po = ProjectCardPo.under(new JestPageObjectElement(container));
      await runResolvedPromises();

      expect(await po.getStatus()).toBe("Status Finalizing");
    });
  });

  describe("not signed in", () => {
    beforeAll(() =>
      authStoreMock.next({
        identity: undefined,
      })
    );

    it("should not display a spinner when the swapCommitment is not loaded", () => {
      const { getByTestId } = render(ProjectCard, {
        props: {
          project: { ...mockSnsFullProject, swapCommitment: undefined },
        },
      });

      expect(() => getByTestId("spinner")).toThrow();
    });
  });
});

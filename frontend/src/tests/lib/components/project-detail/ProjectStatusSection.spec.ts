import ProjectStatusSection from "$lib/components/project-detail/ProjectStatusSection.svelte";
import { authStore } from "$lib/stores/auth.store";
import { snsTicketsStore } from "$lib/stores/sns-tickets.store";
import type { SnsSummary, SnsSwapCommitment } from "$lib/types/sns";
import { mockAuthStoreSubscribe } from "$tests/mocks/auth.store.mock";
import {
  createBuyersState,
  mockSnsFullProject,
  summaryForLifecycle,
} from "$tests/mocks/sns-projects.mock";
import { renderContextCmp } from "$tests/mocks/sns.mock";
import { ProjectStatusSectionPo } from "$tests/page-objects/ProjectStatusSection.page-object";
import { VitestPageObjectElement } from "$tests/page-objects/vitest.page-object";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { waitFor } from "@testing-library/svelte";
import { vi } from "vitest";

describe("ProjectStatusSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    snsTicketsStore.reset();
    vi.spyOn(authStore, "subscribe").mockImplementation(mockAuthStoreSubscribe);
  });

  const render = ({
    summary,
    swapCommitment,
  }: {
    summary?: SnsSummary;
    swapCommitment?: SnsSwapCommitment;
  }): ProjectStatusSectionPo => {
    const { container } = renderContextCmp({
      summary,
      swapCommitment,
      Component: ProjectStatusSection,
    });
    return new ProjectStatusSectionPo(new VitestPageObjectElement(container));
  };

  it("should render subtitle", () => {
    const { container } = renderContextCmp({
      summary: mockSnsFullProject.summary,
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectStatusSection,
    });
    expect(container.querySelector("h2")).toBeInTheDocument();
  });

  it("should render project current commitment", () => {
    const { queryByTestId } = renderContextCmp({
      summary: mockSnsFullProject.summary,
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectStatusSection,
    });
    expect(queryByTestId("sns-project-current-commitment")).toBeInTheDocument();
  });

  it("should render user commitment", async () => {
    const po = render({
      summary: mockSnsFullProject.summary,
      swapCommitment: {
        rootCanisterId: mockSnsFullProject.rootCanisterId,
        myCommitment: createBuyersState(BigInt(2_500_000_000)),
      },
    });
    expect(await po.getCommitmentAmount()).toBe("25.00");
  });

  it("should not render user commitment if no commitment", async () => {
    const po = render({
      summary: mockSnsFullProject.summary,
      swapCommitment: {
        rootCanisterId: mockSnsFullProject.rootCanisterId,
        myCommitment: undefined,
      },
    });
    expect(await po.getCommitmentAmountDisplayPo().isPresent()).toBe(false);
  });

  it("should render project participate button", async () => {
    const summary = summaryForLifecycle(SnsSwapLifecycle.Open);
    const { rootCanisterId } = summary;
    const { queryByTestId } = renderContextCmp({
      summary,
      swapCommitment: undefined,
      Component: ProjectStatusSection,
    });
    expect(
      queryByTestId("sns-project-participate-button")
    ).not.toBeInTheDocument();

    snsTicketsStore.setTicket({
      rootCanisterId,
      ticket: null,
    });
    await waitFor(() =>
      expect(
        queryByTestId("sns-project-participate-button")
      ).toBeInTheDocument()
    );
  });

  it("should not render project participate button for adopted", () => {
    const { queryByTestId } = renderContextCmp({
      summary: summaryForLifecycle(SnsSwapLifecycle.Adopted),
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectStatusSection,
    });
    expect(
      queryByTestId("sns-project-participate-button")
    ).not.toBeInTheDocument();
  });

  it("should not render project participate button for committed projects", () => {
    const { queryByTestId } = renderContextCmp({
      summary: summaryForLifecycle(SnsSwapLifecycle.Committed),
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectStatusSection,
    });
    expect(
      queryByTestId("sns-project-participate-button")
    ).not.toBeInTheDocument();
  });

  it("should not render any content if state pending", () => {
    const { queryByTestId } = renderContextCmp({
      summary: summaryForLifecycle(SnsSwapLifecycle.Pending),
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectStatusSection,
    });
    expect(queryByTestId("sns-project-detail-status")).not.toBeInTheDocument();
  });

  it("should not render any content if state unspecified", () => {
    const { queryByTestId } = renderContextCmp({
      summary: summaryForLifecycle(SnsSwapLifecycle.Unspecified),
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectStatusSection,
    });
    expect(queryByTestId("sns-project-detail-status")).not.toBeInTheDocument();
  });
});

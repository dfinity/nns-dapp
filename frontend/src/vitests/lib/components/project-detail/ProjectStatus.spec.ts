import ProjectStatus from "$lib/components/project-detail/ProjectStatus.svelte";
import {
  getOrCreateSnsFinalizationStatusStore,
  resetSnsFinalizationStatusStore,
} from "$lib/stores/sns-finalization-status.store";
import type { SnsSwapCommitment } from "$lib/types/sns";
import en from "$tests/mocks/i18n.mock";
import { createFinalizationStatusMock } from "$tests/mocks/sns-finalization-status.mock";
import {
  mockSnsFullProject,
  summaryForLifecycle,
} from "$tests/mocks/sns-projects.mock";
import { renderContextCmp } from "$tests/mocks/sns.mock";
import { SnsSwapLifecycle } from "@dfinity/sns";

describe("ProjectStatus", () => {
  beforeEach(() => {
    resetSnsFinalizationStatusStore();
  });

  it("should render accepting participation text when open with success intent", () => {
    const { queryByText, queryByTestId } = renderContextCmp({
      summary: summaryForLifecycle(SnsSwapLifecycle.Open),
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectStatus,
    });
    expect(queryByText(en.sns_project_detail.status_open)).toBeInTheDocument();
    expect(queryByTestId("tag").classList.contains("success")).toBe(true);
  });

  it("should render pending text when not yet open", () => {
    const { queryByText, queryByTestId } = renderContextCmp({
      summary: summaryForLifecycle(SnsSwapLifecycle.Pending),
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectStatus,
    });

    expect(
      queryByText(en.sns_project_detail.status_pending)
    ).toBeInTheDocument();
    expect(queryByTestId("tag").classList.contains("info")).toBe(true);
  });

  it("should render unspecified text if not defined", () => {
    const { queryByText, queryByTestId } = renderContextCmp({
      summary: summaryForLifecycle(SnsSwapLifecycle.Unspecified),
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectStatus,
    });

    expect(
      queryByText(en.sns_project_detail.status_unspecified)
    ).toBeInTheDocument();
    expect(queryByTestId("tag").classList.contains("info")).toBe(true);
  });

  it("should render committed text", () => {
    const { queryByText, queryByTestId } = renderContextCmp({
      summary: summaryForLifecycle(SnsSwapLifecycle.Committed),
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectStatus,
    });

    expect(
      queryByText(en.sns_project_detail.status_committed)
    ).toBeInTheDocument();
    expect(queryByTestId("tag").classList.contains("info")).toBe(true);
  });

  it("should render starting soon text", () => {
    const { queryByText, queryByTestId } = renderContextCmp({
      summary: summaryForLifecycle(SnsSwapLifecycle.Adopted),
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectStatus,
    });

    expect(
      queryByText(en.sns_project_detail.status_adopted)
    ).toBeInTheDocument();
    expect(queryByTestId("tag").classList.contains("info")).toBe(true);
  });

  it("should render aborted text when cancelled", () => {
    const { queryByText, queryByTestId } = renderContextCmp({
      summary: summaryForLifecycle(SnsSwapLifecycle.Aborted),
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectStatus,
    });

    expect(
      queryByText(en.sns_project_detail.status_aborted)
    ).toBeInTheDocument();
    expect(queryByTestId("tag").classList.contains("info")).toBe(true);
  });

  it("should render finalizing text when swap is finalizing", () => {
    const summary = summaryForLifecycle(SnsSwapLifecycle.Committed);
    const store = getOrCreateSnsFinalizationStatusStore(summary.rootCanisterId);
    store.setData({
      data: createFinalizationStatusMock(true),
      certified: true,
    });
    const { queryByText, queryByTestId } = renderContextCmp({
      summary,
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectStatus,
    });

    expect(
      queryByText(en.sns_project_detail.status_finalizing)
    ).toBeInTheDocument();
    expect(queryByTestId("tag").classList.contains("info")).toBe(true);
  });

  it("should render committed text if finalizing data is not finalizing", () => {
    const summary = summaryForLifecycle(SnsSwapLifecycle.Committed);
    const store = getOrCreateSnsFinalizationStatusStore(summary.rootCanisterId);
    store.setData({
      data: createFinalizationStatusMock(false),
      certified: true,
    });
    const { queryByText } = renderContextCmp({
      summary,
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectStatus,
    });

    expect(
      queryByText(en.sns_project_detail.status_committed)
    ).toBeInTheDocument();
  });
});

import ProjectStatus from "$lib/components/project-detail/ProjectStatus.svelte";
import type { SnsSwapCommitment } from "$lib/types/sns";
import en from "$tests/mocks/i18n.mock";
import {
  mockSnsFullProject,
  summaryForLifecycle,
} from "$tests/mocks/sns-projects.mock";
import { renderContextCmp } from "$tests/mocks/sns.mock";
import { SnsSwapLifecycle } from "@dfinity/sns";

describe("ProjectStatus", () => {
  it("should render accepting participation text when open", () => {
    const { queryByText } = renderContextCmp({
      summary: summaryForLifecycle(SnsSwapLifecycle.Open),
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectStatus,
    });
    expect(queryByText(en.sns_project_detail.status_open)).toBeInTheDocument();
  });

  it("should render pending text when not yet open", () => {
    const { queryByText } = renderContextCmp({
      summary: summaryForLifecycle(SnsSwapLifecycle.Pending),
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectStatus,
    });

    expect(
      queryByText(en.sns_project_detail.status_pending)
    ).toBeInTheDocument();
  });

  it("should render unspecified text if not defined", () => {
    const { queryByText } = renderContextCmp({
      summary: summaryForLifecycle(SnsSwapLifecycle.Unspecified),
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectStatus,
    });

    expect(
      queryByText(en.sns_project_detail.status_unspecified)
    ).toBeInTheDocument();
  });

  it("should render committed text", () => {
    const { queryByText } = renderContextCmp({
      summary: summaryForLifecycle(SnsSwapLifecycle.Committed),
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectStatus,
    });

    expect(
      queryByText(en.sns_project_detail.status_committed)
    ).toBeInTheDocument();
  });

  it("should render starting soon text", () => {
    const { queryByText } = renderContextCmp({
      summary: summaryForLifecycle(SnsSwapLifecycle.Adopted),
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectStatus,
    });

    expect(
      queryByText(en.sns_project_detail.status_adopted)
    ).toBeInTheDocument();
  });

  it("should render aborted text when cancelled", () => {
    const { queryByText } = renderContextCmp({
      summary: summaryForLifecycle(SnsSwapLifecycle.Aborted),
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectStatus,
    });

    expect(
      queryByText(en.sns_project_detail.status_aborted)
    ).toBeInTheDocument();
  });
});

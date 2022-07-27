/**
 * @jest-environment jsdom
 */

import { waitFor } from "@testing-library/svelte";
import ProjectStatusSection from "../../../../lib/components/project-detail/ProjectStatusSection.svelte";
import type { SnsSwapCommitment } from "../../../../lib/types/sns";
import { mockSnsFullProject } from "../../../mocks/sns-projects.mock";
import { renderContextCmp } from "../../../mocks/sns.mock";
import { clickByTestId } from "../../testHelpers/clickByTestId";

describe("ProjectStatusSection", () => {
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

  it("should render project participate button", () => {
    const { queryByTestId } = renderContextCmp({
      summary: mockSnsFullProject.summary,
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectStatusSection,
    });
    expect(queryByTestId("sns-project-participate-button")).toBeInTheDocument();
  });

  it("should open swap participation modal on participate click", async () => {
    const { getByTestId } = renderContextCmp({
      summary: mockSnsFullProject.summary,
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectStatusSection,
    });

    await clickByTestId(getByTestId, "sns-project-participate-button");
    await waitFor(() =>
      expect(getByTestId("sns-swap-participate-step-1")).toBeInTheDocument()
    );
  });
});

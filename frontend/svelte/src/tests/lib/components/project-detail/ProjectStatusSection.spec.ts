/**
 * @jest-environment jsdom
 */

import { render, waitFor } from "@testing-library/svelte";
import { writable } from "svelte/store";
import ProjectStatusSection from "../../../../lib/components/project-detail/ProjectStatusSection.svelte";
import {
  PROJECT_DETAIL_CONTEXT_KEY,
  type ProjectDetailContext,
  type ProjectDetailStore,
} from "../../../../lib/types/project-detail.context";
import type { SnsSummary, SnsSwapCommitment } from "../../../../lib/types/sns";
import en from "../../../mocks/i18n.mock";
import { mockSnsFullProject } from "../../../mocks/sns-projects.mock";
import { clickByTestId } from "../../testHelpers/clickByTestId";
import ContextWrapperTest from "../ContextWrapperTest.svelte";

describe("ProjectStatusSection", () => {
  const renderProjectInfoSection = ({
    summary,
    swapState,
  }: {
    summary?: SnsSummary;
    swapState?: SnsSwapCommitment;
  }) =>
    render(ContextWrapperTest, {
      props: {
        contextKey: PROJECT_DETAIL_CONTEXT_KEY,
        contextValue: {
          store: writable<ProjectDetailStore>({
            summary,
            swapCommitment: swapState,
          }),
        } as ProjectDetailContext,
        Component: ProjectStatusSection,
      },
    });

  it("should render subtitle", async () => {
    const { container } = renderProjectInfoSection({
      summary: mockSnsFullProject.summary,
      swapState: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
    });
    expect(container.querySelector("h2")).toBeInTheDocument();
  });

  it("should render project current commitment", async () => {
    const { queryByTestId } = renderProjectInfoSection({
      summary: mockSnsFullProject.summary,
      swapState: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
    });
    expect(queryByTestId("sns-project-current-commitment")).toBeInTheDocument();
  });

  it("should render project participate button", async () => {
    const { queryByTestId } = renderProjectInfoSection({
      summary: mockSnsFullProject.summary,
      swapState: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
    });
    expect(queryByTestId("sns-project-participate-button")).toBeInTheDocument();
  });

  it("should open swap participation modal on participate click", async () => {
    const { getByTestId } = renderProjectInfoSection({
      summary: mockSnsFullProject.summary,
      swapState: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
    });

    await clickByTestId(getByTestId, "sns-project-participate-button");
    await waitFor(() =>
      expect(getByTestId("sns-swap-participate-step-1")).toBeInTheDocument()
    );
  });

  it("should render accepting participation text when open", async () => {
    const { queryByText } = renderProjectInfoSection({
      summary: mockSnsFullProject.summary,
      swapState: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
    });
    expect(queryByText(en.sns_project_detail.accepting)).toBeInTheDocument();
  });

  it("should render pending text when not yet open", async () => {
    const { queryByText } = renderProjectInfoSection({
      summary: {
        ...mockSnsFullProject.summary,
        swapDeadline: BigInt(Math.round(Date.now() / 1000 + 40000)),
        swapStart: BigInt(Math.round(Date.now() / 1000 + 20000)),
      },
      swapState: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
    });

    expect(queryByText(en.sns_project_detail.pending)).toBeInTheDocument();
  });

  it("should render closed text when not yet open", async () => {
    const { queryByText } = renderProjectInfoSection({
      summary: {
        ...mockSnsFullProject.summary,
        swapDeadline: BigInt(Math.round(Date.now() / 1000 - 20000)),
        swapStart: BigInt(Math.round(Date.now() / 1000 - 40000)),
      },
      swapState: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
    });

    expect(queryByText(en.sns_project_detail.closed)).toBeInTheDocument();
  });
});

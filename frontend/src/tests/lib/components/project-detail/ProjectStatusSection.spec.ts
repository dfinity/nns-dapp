/**
 * @jest-environment jsdom
 */

import * as snsSaleApi from "$lib/api/sns-sale.api";
import ProjectStatusSection from "$lib/components/project-detail/ProjectStatusSection.svelte";
import { authStore } from "$lib/stores/auth.store";
import type { SnsSwapCommitment } from "$lib/types/sns";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { mockAuthStoreSubscribe } from "../../../mocks/auth.store.mock";
import {
  mockSnsFullProject,
  summaryForLifecycle,
} from "../../../mocks/sns-projects.mock";
import { renderContextCmp } from "../../../mocks/sns.mock";

describe("ProjectStatusSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
    jest.spyOn(snsSaleApi, "getOpenTicket").mockResolvedValue(undefined);
  });

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

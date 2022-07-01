/**
 * @jest-environment jsdom
 */

import { render, waitFor } from "@testing-library/svelte";
import type { SnsSwapState } from "../../lib/services/sns.mock";
import { loadSnsFullProject } from "../../lib/services/sns.services";
import { routeStore } from "../../lib/stores/route.store";
import {
  snsSummariesStore,
  snsSwapStatesStore,
} from "../../lib/stores/snsProjects.store";
import ProjectDetail from "../../routes/ProjectDetail.svelte";
import { mockRouteStoreSubscribe } from "../mocks/route.store.mock";
import { mockSnsFullProject } from "../mocks/sns-projects.mock";

jest.mock("../../lib/services/sns.services", () => {
  return {
    loadSnsFullProject: jest.fn().mockResolvedValue(Promise.resolve()),
    routePathRootCanisterId: jest
      .fn()
      .mockImplementation(() => mockSnsFullProject.rootCanisterId.toText()),
  };
});

describe("ProjectDetail", () => {
  jest
    .spyOn(routeStore, "subscribe")
    .mockImplementation(
      mockRouteStoreSubscribe(
        `/#/project/${mockSnsFullProject.rootCanisterId.toText()}`
      )
    );
  beforeEach(() => {
    snsSummariesStore.setSummaries({
      summaries: [mockSnsFullProject.summary],
      certified: true,
    });
    snsSwapStatesStore.setSwapState({
      swapState: mockSnsFullProject.swapState as SnsSwapState,
      certified: true,
    });
  });
  it("should render info section", () => {
    const { queryByTestId } = render(ProjectDetail);

    expect(queryByTestId("sns-project-detail-info")).toBeInTheDocument();
  });

  it("should load project detail", () => {
    render(ProjectDetail);

    waitFor(() => expect(loadSnsFullProject).toBeCalled());
  });

  it("should render status section", () => {
    const { queryByTestId } = render(ProjectDetail);

    expect(queryByTestId("sns-project-detail-status")).toBeInTheDocument();
  });
});

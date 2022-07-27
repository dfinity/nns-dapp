/**
 * @jest-environment jsdom
 */

import { render, waitFor } from "@testing-library/svelte";
import { tick } from "svelte";
import {
  loadSnsSummary,
  loadSnsSwapCommitment,
} from "../../lib/services/sns.services";
import {
  snsSummariesStore,
  snsSwapCommitmentsStore,
} from "../../lib/stores/projects.store";
import { routeStore } from "../../lib/stores/route.store";
import type { SnsSwapCommitment } from "../../lib/types/sns";
import ProjectDetail from "../../routes/ProjectDetail.svelte";
import { mockRouteStoreSubscribe } from "../mocks/route.store.mock";
import {
  mockQuerySnsSwapState,
  mockSnsFullProject,
} from "../mocks/sns-projects.mock";

jest.mock("../../lib/services/sns.services", () => {
  return {
    loadSnsSummary: jest.fn().mockImplementation(({ onLoad }) =>
      onLoad({
        response: [mockSnsFullProject.summary, mockQuerySnsSwapState],
      })
    ),
    loadSnsSwapCommitment: jest
      .fn()
      .mockImplementation(({ onLoad }) =>
        onLoad({ response: mockSnsFullProject.swapCommitment })
      ),
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

  it("should load summary", () => {
    render(ProjectDetail);

    waitFor(() => expect(loadSnsSummary).toBeCalled());
  });

  it("should load swap state", () => {
    render(ProjectDetail);

    waitFor(() => expect(loadSnsSwapCommitment).toBeCalled());
  });

  describe("getting certified data from summaries and swaps stores", () => {
    beforeEach(() => {
      jest.clearAllMocks();

      snsSummariesStore.setSummaries({
        summaries: [mockSnsFullProject.summary],
        certified: true,
      });
      snsSwapCommitmentsStore.setSwapCommitment({
        swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
        certified: true,
      });
    });

    afterEach(() => {
      snsSummariesStore.reset();
      snsSwapCommitmentsStore.reset();
      jest.clearAllMocks();
    });

    it("should not load summary if certified version available", async () => {
      render(ProjectDetail);

      await tick();

      expect(loadSnsSummary).toBeCalledTimes(0);
    });

    it("should not load swap state if certified version available", async () => {
      render(ProjectDetail);

      await tick();

      expect(loadSnsSwapCommitment).toBeCalledTimes(0);
    });
  });

  describe("getting uncertified data from summaries and swaps stores", () => {
    beforeEach(() => {
      jest.clearAllMocks();

      snsSummariesStore.setSummaries({
        summaries: [mockSnsFullProject.summary],
        certified: false,
      });
      snsSwapCommitmentsStore.setSwapCommitment({
        swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
        certified: false,
      });
    });

    afterEach(() => {
      snsSummariesStore.reset();
      snsSwapCommitmentsStore.reset();
      jest.clearAllMocks();
    });

    it("should not load summary if certified version available", async () => {
      render(ProjectDetail);

      await tick();

      expect(loadSnsSummary).toBeCalledTimes(1);
    });

    it("should not load swap state if certified version available", async () => {
      render(ProjectDetail);

      await tick();

      expect(loadSnsSwapCommitment).toBeCalledTimes(1);
    });
  });

  it("should render info section", async () => {
    const { queryByTestId } = render(ProjectDetail);

    await waitFor(() =>
      expect(queryByTestId("sns-project-detail-info")).toBeInTheDocument()
    );
  });

  it("should render status section", async () => {
    const { queryByTestId } = render(ProjectDetail);

    await waitFor(() =>
      expect(queryByTestId("sns-project-detail-status")).toBeInTheDocument()
    );
  });
});

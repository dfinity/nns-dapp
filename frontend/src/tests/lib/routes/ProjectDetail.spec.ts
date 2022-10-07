/**
 * @jest-environment jsdom
 */

import { AppPath } from "$lib/constants/routes.constants";
import ProjectDetail from "$lib/routes/ProjectDetail.svelte";
import {
  loadSnsSummary,
  loadSnsSwapCommitment,
} from "$lib/services/sns.services";
import { routeStore } from "$lib/stores/route.store";
import { snsQueryStore, snsSwapCommitmentsStore } from "$lib/stores/sns.store";
import type { SnsSwapCommitment } from "$lib/types/sns";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render, waitFor } from "@testing-library/svelte";
import { mockRouteStoreSubscribe } from "../../mocks/route.store.mock";
import { mockSnsFullProject } from "../../mocks/sns-projects.mock";
import { snsResponsesForLifecycle } from "../../mocks/sns-response.mock";

jest.mock("$lib/services/sns.services", () => {
  return {
    loadSnsSummaries: jest.fn().mockResolvedValue(Promise.resolve()),
    loadSnsSwapCommitments: jest.fn().mockResolvedValue(Promise.resolve()),
    loadSnsSummary: jest.fn().mockResolvedValue(Promise.resolve()),
    loadSnsSwapCommitment: jest.fn().mockResolvedValue(Promise.resolve()),
    routePathRootCanisterId: jest
      .fn()
      .mockImplementation(() => mockSnsFullProject.rootCanisterId.toText()),
  };
});

describe("ProjectDetail", () => {
  describe("present project in store", () => {
    jest
      .spyOn(routeStore, "subscribe")
      .mockImplementation(
        mockRouteStoreSubscribe(
          `${
            AppPath.ProjectDetail
          }/${mockSnsFullProject.rootCanisterId.toText()}`
        )
      );

    beforeEach(() => {
      jest.clearAllMocks();

      snsQueryStore.setData(
        snsResponsesForLifecycle({
          lifecycles: [SnsSwapLifecycle.Open],
          certified: true,
        })
      );
      snsSwapCommitmentsStore.setSwapCommitment({
        swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
        certified: true,
      });
    });

    afterEach(() => {
      snsQueryStore.reset();
      snsSwapCommitmentsStore.reset();
      jest.clearAllMocks();
    });
    it("should load summary", () => {
      render(ProjectDetail);

      waitFor(() => expect(loadSnsSummary).toBeCalled());
    });

    it("should load swap state", () => {
      render(ProjectDetail);

      waitFor(() => expect(loadSnsSwapCommitment).toBeCalled());
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

  describe("invalid root canister id", () => {
    jest
      .spyOn(routeStore, "subscribe")
      .mockImplementation(
        mockRouteStoreSubscribe(`${AppPath.ProjectDetail}/invalid-project`)
      );
    jest.spyOn(routeStore, "replace");
    it("should rediret to launchpad", () => {
      render(ProjectDetail);

      waitFor(() => expect(routeStore.replace).toBeCalled());
    });
  });

  describe("not found canister id", () => {
    jest
      .spyOn(routeStore, "subscribe")
      .mockImplementation(
        mockRouteStoreSubscribe(`${AppPath.ProjectDetail}/aaaaa-aa`)
      );
    jest.spyOn(routeStore, "replace");
    it("should rediret to launchpad", () => {
      render(ProjectDetail);

      waitFor(() => expect(routeStore.replace).toBeCalled());
    });
  });
});

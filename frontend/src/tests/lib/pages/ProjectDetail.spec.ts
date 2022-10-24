/**
 * @jest-environment jsdom
 */

import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import ProjectDetail from "$lib/pages/ProjectDetail.svelte";
import {
  loadSnsSummary,
  loadSnsSwapCommitment,
} from "$lib/services/sns.services";
import { snsQueryStore, snsSwapCommitmentsStore } from "$lib/stores/sns.store";
import type { SnsSwapCommitment } from "$lib/types/sns";
import { page } from "$mocks/$app/stores";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
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
    page.mock({ data: { universe: null } });

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

    const props = {
      rootCanisterId: mockSnsFullProject.rootCanisterId.toText(),
    };

    it("should load summary", () => {
      render(ProjectDetail, props);

      waitFor(() => expect(loadSnsSummary).toBeCalled());
    });

    it("should load swap state", () => {
      render(ProjectDetail, props);

      waitFor(() => expect(loadSnsSwapCommitment).toBeCalled());
    });

    it("should render info section", async () => {
      const { queryByTestId } = render(ProjectDetail, props);

      await waitFor(() =>
        expect(queryByTestId("sns-project-detail-info")).toBeInTheDocument()
      );
    });

    it("should render status section", async () => {
      const { queryByTestId } = render(ProjectDetail, props);

      await waitFor(() =>
        expect(queryByTestId("sns-project-detail-status")).toBeInTheDocument()
      );
    });
  });

  describe("invalid root canister id", () => {
    page.mock({ data: { universe: null } });

    it("should redirect to launchpad", () => {
      render(ProjectDetail, {
        props: {
          rootCanisterId: "invalid-project",
        },
      });

      waitFor(() => {
        const { path } = get(pageStore);
        expect(path).toEqual(AppPath.Launchpad);
      });
    });
  });

  describe("not found canister id", () => {
    page.mock({ data: { universe: null } });

    it("should redirect to launchpad", () => {
      render(ProjectDetail, {
        props: {
          rootCanisterId: "aaaaa-aa",
        },
      });

      waitFor(() => {
        const { path } = get(pageStore);
        expect(path).toEqual(AppPath.Launchpad);
      });
    });
  });
});

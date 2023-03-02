/**
 * @jest-environment jsdom
 */

import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import ProjectDetail from "$lib/pages/ProjectDetail.svelte";
import {
  loadSnsSwapCommitment,
  watchSnsTotalCommitment,
} from "$lib/services/sns.services";
import { authStore } from "$lib/stores/auth.store";
import { snsQueryStore, snsSwapCommitmentsStore } from "$lib/stores/sns.store";
import type { SnsSwapCommitment } from "$lib/types/sns";
import { page } from "$mocks/$app/stores";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { mockAuthStoreSubscribe } from "../../mocks/auth.store.mock";
import { mockSnsFullProject } from "../../mocks/sns-projects.mock";
import { snsResponsesForLifecycle } from "../../mocks/sns-response.mock";

const mockUnwatchCall = jest.fn();
jest.mock("$lib/services/sns.services", () => {
  return {
    loadSnsSwapCommitment: jest.fn().mockResolvedValue(Promise.resolve()),
    loadSnsTotalCommitment: jest.fn().mockResolvedValue(Promise.resolve()),
    watchSnsTotalCommitment: jest
      .fn()
      .mockImplementation(() => mockUnwatchCall),
  };
});

describe("ProjectDetail", () => {
  const props = {
    rootCanisterId: mockSnsFullProject.rootCanisterId.toText(),
  };

  describe("not logged in user", () => {
    page.mock({ data: { universe: null } });

    beforeEach(() => {
      jest.clearAllMocks();
      snsQueryStore.reset();
      snsSwapCommitmentsStore.reset();

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

    it("should start watching derived state", async () => {
      render(ProjectDetail, props);

      await waitFor(() => expect(watchSnsTotalCommitment).toBeCalled());
    });

    it("should clear eatch on unmount", async () => {
      const { unmount } = render(ProjectDetail, props);

      expect(mockUnwatchCall).not.toBeCalled();

      unmount();

      await waitFor(() => expect(mockUnwatchCall).toBeCalledTimes(1));
    });

    it("should not load user's commitnemtn", async () => {
      render(ProjectDetail, props);

      await waitFor(() => expect(loadSnsSwapCommitment).not.toBeCalled());
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

  describe("logged in user", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      snsQueryStore.reset();
      snsSwapCommitmentsStore.reset();
      jest
        .spyOn(authStore, "subscribe")
        .mockImplementation(mockAuthStoreSubscribe);
    });

    it("should start watching derived state", async () => {
      render(ProjectDetail, props);

      await waitFor(() => expect(watchSnsTotalCommitment).toBeCalled());
    });

    it("should clear eatch on unmount", async () => {
      const { unmount } = render(ProjectDetail, props);

      expect(mockUnwatchCall).not.toBeCalled();

      unmount();

      await waitFor(() => expect(mockUnwatchCall).toBeCalledTimes(1));
    });

    it("should load user's commitment", async () => {
      render(ProjectDetail, props);

      await waitFor(() => expect(loadSnsSwapCommitment).toBeCalled());
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

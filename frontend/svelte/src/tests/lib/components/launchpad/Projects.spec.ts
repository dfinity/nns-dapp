/**
 * @jest-environment jsdom
 */

import { render, waitFor } from "@testing-library/svelte";
import Projects from "../../../../lib/components/launchpad/Projects.svelte";
import {
  loadSnsSummaries,
  loadSnsSwapStates,
} from "../../../../lib/services/sns.services";
import {
  snsesCountStore,
  snsSummariesStore,
  snsSwapStatesStore,
} from "../../../../lib/stores/projects.store";
import en from "../../../mocks/i18n.mock";
import {
  mockSnsSummaryList,
  mockSnsSwapState,
} from "../../../mocks/sns-projects.mock";

jest.mock("../../../../lib/services/sns.services", () => {
  return {
    loadSnsSummaries: jest.fn().mockResolvedValue(Promise.resolve()),
    loadSnsSwapStates: jest.fn().mockResolvedValue(Promise.resolve()),
  };
});

describe("Projects", () => {
  beforeEach(() => {
    snsSummariesStore.reset();
    snsSwapStatesStore.reset();
  });

  afterEach(jest.clearAllMocks);

  it("should trigger loadSnsFullProjects", () => {
    render(Projects);

    expect(loadSnsSummaries).toBeCalled();
  });

  it("should trigger loadSnsSwapStates", () => {
    render(Projects);

    expect(loadSnsSwapStates).toBeCalled();
  });

  it("should not load data when already loaded", () => {
    const principal = mockSnsSummaryList[0].rootCanisterId;

    snsSummariesStore.setSummaries({
      summaries: mockSnsSummaryList,
      certified: false,
    });
    snsSwapStatesStore.setSwapState({
      swapState: mockSnsSwapState(principal),
      certified: false,
    });

    render(Projects);

    expect(loadSnsSummaries).not.toBeCalled();
    expect(loadSnsSwapStates).not.toBeCalled();
  });

  it("should not load data if store-state is null (loading)", () => {
    snsSummariesStore.setLoadingState();
    snsSwapStatesStore.setLoadingState();

    render(Projects);

    expect(loadSnsSummaries).not.toBeCalled();
    expect(loadSnsSwapStates).not.toBeCalled();
  });

  it("should render projects", () => {
    const principal = mockSnsSummaryList[0].rootCanisterId;

    snsSummariesStore.setSummaries({
      summaries: mockSnsSummaryList,
      certified: false,
    });
    snsSwapStatesStore.setSwapState({
      swapState: mockSnsSwapState(principal),
      certified: false,
    });

    const { getAllByTestId } = render(Projects);

    expect(getAllByTestId("card").length).toBe(mockSnsSummaryList.length);
  });

  it("should render a message when no projects available", () => {
    const principal = mockSnsSummaryList[0].rootCanisterId;

    snsSummariesStore.setSummaries({
      summaries: [],
      certified: false,
    });
    snsSwapStatesStore.setSwapState({
      swapState: mockSnsSwapState(principal),
      certified: false,
    });

    const { queryByText } = render(Projects);

    expect(queryByText(en.sns_launchpad.no_projects)).toBeInTheDocument();
  });

  it("should render spinner on loading", () => {
    const { queryByTestId } = render(Projects);
    expect(queryByTestId("spinner")).toBeInTheDocument();
  });

  it("should render skeletons after snsesCountStore update", async () => {
    const { getAllByTestId } = render(Projects);

    snsesCountStore.set(3);

    await waitFor(() =>
      expect(getAllByTestId("skeleton-card").length).toBeGreaterThanOrEqual(3)
    );
  });
});

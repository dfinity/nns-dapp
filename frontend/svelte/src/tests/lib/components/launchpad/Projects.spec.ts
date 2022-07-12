/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import Projects from "../../../../lib/components/launchpad/Projects.svelte";
import { loadSnsSummaries } from "../../../../lib/services/sns.services";
import {
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
  beforeEach(snsSummariesStore.reset);

  it("should trigger loadSnsFullProjects", () => {
    render(Projects);

    expect(loadSnsSummaries).toBeCalled();
  });

  it("should render projects", () => {
    const principal = mockSnsSummaryList[0].rootCanisterId;

    snsSummariesStore.setSummaries({
      summaries: mockSnsSummaryList,
      certified: false,
    });
    snsSwapStatesStore.setSwapState({
      swapState: mockSnsSwapState(principal),
      certified: true,
    });

    const { getAllByTestId } = render(Projects);

    expect(getAllByTestId("card").length).toBe(mockSnsSummaryList.length);
  });

  it("should render a message when no projects available", () => {
    snsSummariesStore.setSummaries({
      summaries: [],
      certified: false,
    });

    const { queryByText } = render(Projects);

    expect(queryByText(en.sns_launchpad.no_projects)).toBeInTheDocument();
  });

  it("should render skeletons on loading", () => {
    const { queryAllByTestId } = render(Projects);
    expect(queryAllByTestId("skeleton-card").length).toBeGreaterThanOrEqual(1);
  });
});

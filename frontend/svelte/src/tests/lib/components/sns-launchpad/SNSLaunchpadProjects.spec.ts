/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import SNSProjects from "../../../../lib/components/sns-launchpad/SNSProjects.svelte";
import { loadSnsFullProjects } from "../../../../lib/services/sns.services";
import {
  snsSummariesStore,
  snsSwapStatesStore,
} from "../../../../lib/stores/snsProjects.store";
import en from "../../../mocks/i18n.mock";
import {
  mockSnsSummaryList,
  mockSnsSwapState,
} from "../../../mocks/sns-projects.mock";

jest.mock("../../../../lib/services/sns.services", () => {
  return {
    loadSnsFullProjects: jest.fn().mockResolvedValue(Promise.resolve()),
  };
});

describe("SNSProjects", () => {
  beforeEach(snsSummariesStore.reset);

  it("should trigger loadSnsFullProjects", () => {
    render(SNSProjects);

    expect(loadSnsFullProjects).toBeCalled();
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

    const { getAllByTestId } = render(SNSProjects);

    expect(getAllByTestId("card").length).toBe(mockSnsSummaryList.length);
  });

  it("should render a message when no projects available", () => {
    snsSummariesStore.setSummaries({
      summaries: [],
      certified: false,
    });

    const { queryByText } = render(SNSProjects);

    expect(queryByText(en.sns_launchpad.no_projects)).toBeInTheDocument();
  });

  it("should render skeletons on loading", () => {
    const { queryAllByTestId } = render(SNSProjects);
    expect(queryAllByTestId("skeleton-card").length).toBeGreaterThanOrEqual(1);
  });
});

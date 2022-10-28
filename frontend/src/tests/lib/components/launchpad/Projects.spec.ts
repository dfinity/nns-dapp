/**
 * @jest-environment jsdom
 */

import Projects from "$lib/components/launchpad/Projects.svelte";
import { snsQueryStore, snsSwapCommitmentsStore } from "$lib/stores/sns.store";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render, waitFor } from "@testing-library/svelte";
import en from "../../../mocks/i18n.mock";
import {
  mockSnsSummaryList,
  mockSnsSwapCommitment,
} from "../../../mocks/sns-projects.mock";
import { snsResponsesForLifecycle } from "../../../mocks/sns-response.mock";

jest.mock("$lib/services/sns.services", () => {
  return {
    loadSnsSummaries: jest.fn().mockResolvedValue(Promise.resolve()),
    loadSnsSwapCommitments: jest.fn().mockResolvedValue(Promise.resolve()),
  };
});

describe("Projects", () => {
  beforeEach(() => {
    snsQueryStore.reset();
    snsSwapCommitmentsStore.reset();
  });

  afterEach(jest.clearAllMocks);

  it("should render 'Open' projects", () => {
    const principal = mockSnsSummaryList[0].rootCanisterId;

    const lifecycles = [
      SnsSwapLifecycle.Open,
      SnsSwapLifecycle.Open,
      SnsSwapLifecycle.Committed,
      SnsSwapLifecycle.Open,
    ];

    snsQueryStore.setData(
      snsResponsesForLifecycle({
        lifecycles,
      })
    );
    snsSwapCommitmentsStore.setSwapCommitment({
      swapCommitment: mockSnsSwapCommitment(principal),
      certified: false,
    });

    const { getAllByTestId } = render(Projects, {
      props: {
        status: SnsSwapLifecycle.Open,
      },
    });

    expect(getAllByTestId("card").length).toBe(
      lifecycles.filter((lc) => lc === SnsSwapLifecycle.Open).length
    );
  });

  it("should render 'Committed' projects", () => {
    const principal = mockSnsSummaryList[0].rootCanisterId;

    const lifecycles = [
      SnsSwapLifecycle.Open,
      SnsSwapLifecycle.Open,
      SnsSwapLifecycle.Committed,
      SnsSwapLifecycle.Open,
    ];

    snsQueryStore.setData(
      snsResponsesForLifecycle({
        lifecycles,
      })
    );
    snsSwapCommitmentsStore.setSwapCommitment({
      swapCommitment: mockSnsSwapCommitment(principal),
      certified: false,
    });

    const { getAllByTestId } = render(Projects, {
      props: {
        status: SnsSwapLifecycle.Committed,
      },
    });

    expect(getAllByTestId("card").length).toBe(
      lifecycles.filter((lc) => lc === SnsSwapLifecycle.Committed).length
    );
  });

  it("should render a message when no open projects available", () => {
    const principal = mockSnsSummaryList[0].rootCanisterId;

    snsQueryStore.setData([[], []]);
    snsSwapCommitmentsStore.setSwapCommitment({
      swapCommitment: mockSnsSwapCommitment(principal),
      certified: false,
    });

    const { queryByText } = render(Projects, {
      props: {
        status: SnsSwapLifecycle.Open,
      },
    });

    expect(queryByText(en.sns_launchpad.no_open_projects)).toBeInTheDocument();
  });

  it("should render a message when no committed projects available", () => {
    const principal = mockSnsSummaryList[0].rootCanisterId;

    snsQueryStore.setData([[], []]);
    snsSwapCommitmentsStore.setSwapCommitment({
      swapCommitment: mockSnsSwapCommitment(principal),
      certified: false,
    });

    const { queryByText } = render(Projects, {
      props: {
        status: SnsSwapLifecycle.Committed,
      },
    });

    expect(
      queryByText(en.sns_launchpad.no_committed_projects)
    ).toBeInTheDocument();
  });

  it("should render skeletons", async () => {
    const { getAllByTestId } = render(Projects, {
      props: {
        status: SnsSwapLifecycle.Open,
      },
    });

    await waitFor(() =>
      expect(getAllByTestId("skeleton-card").length).toBeGreaterThan(0)
    );
  });
});

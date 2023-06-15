/**
 * @jest-environment jsdom
 */

import Projects from "$lib/components/launchpad/Projects.svelte";
import { snsQueryStore, snsSwapCommitmentsStore } from "$lib/stores/sns.store";
import {
  mockSnsSummaryList,
  mockSnsSwapCommitment,
} from "$tests/mocks/sns-projects.mock";
import { snsResponsesForLifecycle } from "$tests/mocks/sns-response.mock";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render, waitFor } from "@testing-library/svelte";

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
        testId: "open-projects",
        status: SnsSwapLifecycle.Open,
      },
    });

    expect(getAllByTestId("project-card-component").length).toBe(
      lifecycles.filter((lc) => lc === SnsSwapLifecycle.Open).length
    );
  });

  it("should render 'Adopted' projects", () => {
    const principal = mockSnsSummaryList[0].rootCanisterId;

    const lifecycles = [
      SnsSwapLifecycle.Open,
      SnsSwapLifecycle.Adopted,
      SnsSwapLifecycle.Committed,
      SnsSwapLifecycle.Adopted,
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
        testId: "upcoming-projects",
        status: SnsSwapLifecycle.Adopted,
      },
    });

    expect(getAllByTestId("project-card-component").length).toBe(
      lifecycles.filter((lc) => lc === SnsSwapLifecycle.Adopted).length
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
        testId: "committed-projects",
        status: SnsSwapLifecycle.Committed,
      },
    });

    expect(getAllByTestId("project-card-component").length).toBe(
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

    const { queryByTestId } = render(Projects, {
      props: {
        testId: "open-projects",
        status: SnsSwapLifecycle.Open,
      },
    });

    expect(queryByTestId("no-projects-message")).toBeInTheDocument();
  });

  it("should render a message when no adopted projects available", () => {
    const principal = mockSnsSummaryList[0].rootCanisterId;

    snsQueryStore.setData([[], []]);
    snsSwapCommitmentsStore.setSwapCommitment({
      swapCommitment: mockSnsSwapCommitment(principal),
      certified: false,
    });

    const { queryByTestId } = render(Projects, {
      props: {
        testId: "upcoming-projects",
        status: SnsSwapLifecycle.Adopted,
      },
    });

    expect(queryByTestId("no-projects-message")).toBeInTheDocument();
  });

  it("should render a message when no committed projects available", () => {
    const principal = mockSnsSummaryList[0].rootCanisterId;

    snsQueryStore.setData([[], []]);
    snsSwapCommitmentsStore.setSwapCommitment({
      swapCommitment: mockSnsSwapCommitment(principal),
      certified: false,
    });

    const { queryByTestId } = render(Projects, {
      props: {
        testId: "committed-projects",
        status: SnsSwapLifecycle.Committed,
      },
    });

    expect(queryByTestId("no-projects-message")).toBeInTheDocument();
  });

  it("should render skeletons", async () => {
    const { getAllByTestId } = render(Projects, {
      props: {
        testId: "open-projects",
        status: SnsSwapLifecycle.Open,
      },
    });

    await waitFor(() =>
      expect(getAllByTestId("skeleton-card").length).toBeGreaterThan(0)
    );
  });
});

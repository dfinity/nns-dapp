import SnsProposalsFilters from "$lib/components/sns-proposals/SnsProposalsFilters.svelte";
import { snsFiltersStore } from "$lib/stores/sns-filters.store";
import { page } from "$mocks/$app/stores";
import { nativeNervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import { mockSnsFullProject } from "$tests/mocks/sns-projects.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("SnsProposalsFilters", () => {
  beforeEach(() => {
    setSnsProjects([
      {
        rootCanisterId: mockSnsFullProject.rootCanisterId,
        lifecycle: SnsSwapLifecycle.Committed,
      },
    ]);
    page.mock({
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    });
  });

  it("should update types in snsFiltersStore", () => {
    snsFiltersStore.setTypes({
      rootCanisterId: mockSnsFullProject.rootCanisterId,
      types: [],
    });

    render(SnsProposalsFilters, {
      props: {
        nsFunctions: [nativeNervousSystemFunctionMock],
      },
    });

    expect(
      get(snsFiltersStore)[mockSnsFullProject.rootCanisterId.toText()].types
    ).toEqual([
      {
        id: "1",
        name: "Motion",
        value: "1",
        checked: true,
      },
    ]);
  });

  it("should render types filter button", () => {
    const { queryByTestId } = render(SnsProposalsFilters, {
      props: {
        nsFunctions: [],
      },
    });

    expect(queryByTestId("filters-by-types")).toBeInTheDocument();
  });

  // TODO(max): restore should show filter modal when types filter is clicked

  it("should render status filter button", () => {
    const { queryByTestId } = render(SnsProposalsFilters, {
      props: {
        nsFunctions: [],
      },
    });

    expect(queryByTestId("filters-by-status")).toBeInTheDocument();
  });

  it("should show filter modal when status filter is clicked", async () => {
    const { queryByTestId } = render(SnsProposalsFilters, {
      props: {
        nsFunctions: [],
      },
    });

    const statusFilterButton = queryByTestId("filters-by-status");
    statusFilterButton && fireEvent.click(statusFilterButton);

    await waitFor(() =>
      expect(queryByTestId("filter-modal")).toBeInTheDocument()
    );
  });

  it("should show filter modal when rewards filter is clicked", async () => {
    const { queryByTestId } = render(SnsProposalsFilters, {
      props: {
        nsFunctions: [],
      },
    });

    const statusFilterButton = queryByTestId("filters-by-rewards");
    statusFilterButton && fireEvent.click(statusFilterButton);

    await waitFor(() =>
      expect(queryByTestId("filter-modal")).toBeInTheDocument()
    );
  });
});

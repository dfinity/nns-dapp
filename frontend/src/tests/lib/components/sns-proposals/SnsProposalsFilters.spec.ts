import SnsProposalsFilters from "$lib/components/sns-proposals/SnsProposalsFilters.svelte";
import { snsFiltersStore } from "$lib/stores/sns-filters.store";
import { page } from "$mocks/$app/stores";
import { nativeNervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import { mockSnsFullProject } from "$tests/mocks/sns-projects.mock";
import { fireEvent, render, waitFor } from "@testing-library/svelte";

describe("SnsProposalsFilters", () => {
  const renderComponent = () =>
    render(SnsProposalsFilters, {
      props: {
        nsFunctions: [nativeNervousSystemFunctionMock],
      },
    });

  beforeEach(() => {
    page.mock({
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    });
  });

  it("should render status filter button", () => {
    const { queryByTestId } = renderComponent();

    expect(queryByTestId("filters-by-status")).toBeInTheDocument();
  });

  it("should show filter modal when status filter is clicked", async () => {
    const { queryByTestId } = renderComponent();

    const statusFilterButton = queryByTestId("filters-by-status");
    statusFilterButton && fireEvent.click(statusFilterButton);

    await waitFor(() =>
      expect(queryByTestId("filter-modal")).toBeInTheDocument()
    );
  });

  it("should show filter modal when rewards filter is clicked", async () => {
    const { queryByTestId } = renderComponent();

    const statusFilterButton = queryByTestId("filters-by-rewards");
    statusFilterButton && fireEvent.click(statusFilterButton);

    await waitFor(() =>
      expect(queryByTestId("filter-modal")).toBeInTheDocument()
    );
  });

  it("should update snsFiltersStore with types", async () => {
    const setTypesSpy = vi.spyOn(snsFiltersStore, "setTypes");
    expect(setTypesSpy).toBeCalledTimes(0);

    renderComponent();

    expect(setTypesSpy).toBeCalledTimes(1);
    expect(setTypesSpy).toBeCalledWith({
      rootCanisterId: mockSnsFullProject.rootCanisterId,
      types: [
        {
          checked: true,
          id: "1",
          name: "Motion",
          value: "1",
        },
      ],
    });
  });
});

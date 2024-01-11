import SnsProposalsFilters from "$lib/components/sns-proposals/SnsProposalsFilters.svelte";
import { page } from "$mocks/$app/stores";
import { mockSnsFullProject } from "$tests/mocks/sns-projects.mock";
import { fireEvent, render, waitFor } from "@testing-library/svelte";

describe("SnsProposalsFilters", () => {
  const renderComponent = () => render(SnsProposalsFilters);

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
});

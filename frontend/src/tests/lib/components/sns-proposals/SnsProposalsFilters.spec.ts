/**
 * @jest-environment jsdom
 */

import SnsProposalsFilters from "$lib/components/sns-proposals/SnsProposalsFilters.svelte";
import { fireEvent, render, waitFor } from "@testing-library/svelte";

describe("SnsProposalsFilters", () => {
  it("should render status filter button", () => {
    const { queryByTestId } = render(SnsProposalsFilters);

    expect(queryByTestId("filters-by-status")).toBeInTheDocument();
  });

  it("should show filter modal when status filter is clicked", async () => {
    const { queryByTestId } = render(SnsProposalsFilters);

    const statusFilterButton = queryByTestId("filters-by-status");
    statusFilterButton && fireEvent.click(statusFilterButton);

    await waitFor(() =>
      expect(queryByTestId("filter-modal")).toBeInTheDocument()
    );
  });

  it("should show filter modal when rewards filter is clicked", async () => {
    const { queryByTestId } = render(SnsProposalsFilters);

    const statusFilterButton = queryByTestId("filters-by-rewards");
    statusFilterButton && fireEvent.click(statusFilterButton);

    await waitFor(() =>
      expect(queryByTestId("filter-modal")).toBeInTheDocument()
    );
  });
});

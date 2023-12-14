import FiltersButton from "$lib/components/ui/FiltersButton.svelte";
import { render } from "@testing-library/svelte";

describe("FiltersButton", () => {
  it("should render a button", () => {
    const { container } = render(FiltersButton, {
      totalFilters: 1,
      activeFilters: 1,
    });

    expect(container.querySelector("button")).not.toBeNull();
  });

  it("should render an icon", () => {
    const { container, getByTestId } = render(FiltersButton, {
      totalFilters: 1,
      activeFilters: 1,
    });

    expect(container.querySelector("svg")).not.toBeNull();
    expect(() => getByTestId("spinner")).toThrow();
  });

  it("should render a spinner", () => {
    const { getByTestId } = render(FiltersButton, {
      totalFilters: 1,
      activeFilters: 1,
      showSpinner: true,
    });

    expect(getByTestId("spinner")).not.toBeNull();
  });

  it("should render a text for the number of filters", () => {
    const { container } = render(FiltersButton, {
      totalFilters: 7,
      activeFilters: 3,
    });

    const small = container.querySelector("small");
    expect(small?.textContent).toEqual("(3/7)");
  });
});

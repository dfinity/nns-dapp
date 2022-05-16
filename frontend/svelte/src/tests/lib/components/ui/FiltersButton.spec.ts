/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import FiltersButton from "../../../../lib/components/ui/FiltersButton.svelte";

describe("FiltersButton", () => {
  it("should render a button", () => {
    const { container } = render(FiltersButton, {
      totalFilters: 1,
      activeFilters: 1,
    });

    expect(container.querySelector("button")).not.toBeNull();
  });

  it("should render an icon", () => {
    const { container } = render(FiltersButton, {
      totalFilters: 1,
      activeFilters: 1,
    });

    expect(container.querySelector("svg")).not.toBeNull();
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

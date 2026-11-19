import { render } from "@testing-library/svelte";
import NavTest from "./NavTest.svelte";

describe("Nav", () => {
  it("should render slotted elements", () => {
    const { getByTestId } = render(NavTest);

    expect(getByTestId("nav-test-1")).not.toBeNull();
    expect(getByTestId("nav-test-2")).not.toBeNull();
  });

  it("should render a nav", () => {
    const { container } = render(NavTest);

    expect(container.querySelector("nav")).not.toBeNull();
  });
});

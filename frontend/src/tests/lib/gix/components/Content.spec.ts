import { layoutMenuOpen } from "$lib/gix/stores/layout.store";
import { render } from "@testing-library/svelte";
import ContentTest from "./ContentTest.svelte";

describe("Content", () => {
  it("should render slotted elements", () => {
    const { getByTestId } = render(ContentTest);

    expect(getByTestId("content-test-slot")).not.toBeNull();
    expect(getByTestId("content-test-title-slot")).not.toBeNull();
    expect(getByTestId("content-test-toolbar-end-slot")).not.toBeNull();
  });

  it("should render backdrop", () => {
    layoutMenuOpen.set(true);

    const { getByTestId } = render(ContentTest);

    expect(getByTestId("backdrop")).not.toBeNull();
  });

  it("should render a header", () => {
    const { container } = render(ContentTest);

    expect(container.querySelector("header")).not.toBeNull();
  });
});

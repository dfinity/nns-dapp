import { layoutMenuOpen } from "$lib/gix/stores/layout.store";
import { render } from "@testing-library/svelte";
import SplitContentTest from "./SplitContentTest.svelte";

describe("SplitContent", () => {
  it("should render slotted elements", () => {
    const { getByTestId } = render(SplitContentTest);

    expect(getByTestId("content-test-start-slot")).not.toBeNull();
    expect(getByTestId("content-test-end-slot")).not.toBeNull();
    expect(getByTestId("content-test-title-slot")).not.toBeNull();
    expect(getByTestId("content-test-toolbar-end-slot")).not.toBeNull();
  });

  it("should render two backdrops", () => {
    layoutMenuOpen.set(true);

    const { getAllByTestId } = render(SplitContentTest);

    expect(getAllByTestId("backdrop")).toHaveLength(2);
  });

  it("should render a header", () => {
    const { container } = render(SplitContentTest);

    expect(container.querySelector("header")).not.toBeNull();
  });

  it("should reset content scroll position", () => {
    const { container, component } = render(SplitContentTest);

    const scrollableContent = container.querySelector(
      ".scrollable-content-end"
    ) as HTMLElement;
    scrollableContent.scrollTop = 100;

    expect(scrollableContent.scrollTop).toEqual(100);

    component.originalComponent.resetScrollPosition();

    expect(scrollableContent.scrollTop).toEqual(0);
  });
});

import Layout from "$lib/gix/components/Layout.svelte";
import { render } from "@testing-library/svelte";

describe("Layout", () => {
  it("should render a sticky menu", () => {
    const { getByTestId } = render(Layout, {
      props: {
        layout: "split",
      },
    });

    expect(getByTestId("menu-inner")).toHaveClass("sticky");
  });

  it("should not render a sticky menu", () => {
    const { getByTestId } = render(Layout, {
      props: {
        layout: "stretch",
      },
    });

    expect(getByTestId("menu-inner")).not.toHaveClass("sticky");
  });

  it("should render split-pane", () => {
    const { container } = render(Layout, {
      props: {
        layout: "split",
      },
    });

    expect(container.querySelector(".split-pane")).not.toBeNull();
  });

  it("should render stretch-pane", () => {
    const { container } = render(Layout, {
      props: {
        layout: "stretch",
      },
    });

    expect(container.querySelector(".stretch-pane")).not.toBeNull();
  });
});

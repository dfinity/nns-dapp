import SkeletonText from "$lib/gix/components/SkeletonText.svelte";
import { render } from "@testing-library/svelte";

describe("SkeletonText", () => {
  it("should contains a selector for external test", () => {
    const { getByTestId } = render(SkeletonText);

    expect(getByTestId("skeleton-text")).not.toBeNull();
  });

  it("should render an animated style", () => {
    const { getByTestId } = render(SkeletonText, { props: { animated: true } });

    expect(
      getByTestId("skeleton-text").classList.contains("animated")
    ).toBeTruthy();
  });

  it("should render a span per default", () => {
    const { container } = render(SkeletonText);

    expect(container.querySelector("span")).not.toBeNull();
  });

  it("should render a p", () => {
    const { container } = render(SkeletonText, {
      props: { tagName: "p" },
    });

    expect(container.querySelector("span")).toBeNull();
    expect(container.querySelector("p")).not.toBeNull();
  });

  it("should render a h1", () => {
    const { container } = render(SkeletonText, {
      props: { tagName: "h1" },
    });

    expect(container.querySelector("h1")).not.toBeNull();
  });

  it("should render a h2", () => {
    const { container } = render(SkeletonText, {
      props: { tagName: "h2" },
    });

    expect(container.querySelector("h2")).not.toBeNull();
  });

  it("should render a h3", () => {
    const { container } = render(SkeletonText, {
      props: { tagName: "h3" },
    });

    expect(container.querySelector("h3")).not.toBeNull();
  });
});

import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
import { render } from "@testing-library/svelte";

describe("SkeletonCard", () => {
  it("should render small", () => {
    const { container } = render(SkeletonCard);
    expect(container.querySelectorAll("span")?.length).toEqual(4);
  });

  it("should render medium", () => {
    const { container } = render(SkeletonCard, { props: { size: "medium" } });
    expect(container.querySelectorAll("span")?.length).toEqual(6);
  });

  it("should render large", () => {
    const { container } = render(SkeletonCard, { props: { size: "large" } });
    expect(container.querySelectorAll("span")?.length).toEqual(8);
  });
});

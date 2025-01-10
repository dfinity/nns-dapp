import { render } from "@testing-library/svelte";
import TagsListTest from "$tests/lib/components/ui/TagsListTest.svelte";

describe("TagsList", () => {
  it("should render a ul", () => {
    const { container } = render(TagsListTest);
    expect(container.querySelector("ul")).toBeInTheDocument();
  });

  it("should render title and children", () => {
    const { queryAllByTestId, queryByTestId } = render(TagsListTest);
    expect(queryByTestId("title")).toBeInTheDocument();
    expect(queryAllByTestId("item").length).toBe(2);
  });
});

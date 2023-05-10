import { render } from "@testing-library/svelte";
import TagsListTest from "./TagsListTest.svelte";

describe("CardBlock", () => {
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

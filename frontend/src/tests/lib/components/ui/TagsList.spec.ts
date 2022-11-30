/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/svelte";
import TagsListTest from "./TagsListTest.svelte";

describe("CardBlock", () => {
  it("should render a button and a ul", () => {
    const { container } = render(TagsListTest);
    expect(container.querySelector("button")).toBeInTheDocument();
    expect(container.querySelector("ul")).toBeInTheDocument();
  });

  it("should render title and children", () => {
    const { queryAllByTestId, queryByTestId } = render(TagsListTest);
    expect(queryByTestId("title")).toBeInTheDocument();
    expect(queryAllByTestId("item").length).toBe(2);
  });

  it("should trigger event on button click", (done) => {
    const { component, queryByTestId } = render(TagsListTest);
    component.$on("nnsTitleClick", () => done());
    const button = queryByTestId("tag-list-title");
    fireEvent.click(button);
  });
});

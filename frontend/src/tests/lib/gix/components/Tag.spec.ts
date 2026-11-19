import Tag from "$lib/gix/components/Tag.svelte";
import { render } from "@testing-library/svelte";
import { mockSnippet } from "../mocks/snippet.mocks";
import TagTest from "./TagTest.svelte";

describe("Tag", () => {
  it("should render a span element by default", () => {
    const { container } = render(Tag, {
      props: { children: mockSnippet },
    });

    expect(container.querySelector("span")).not.toBeNull();
  });

  it("should render the passed tagname", () => {
    const { container } = render(Tag, {
      props: { tagName: "span", children: mockSnippet },
    });

    expect(container.querySelector("span")).not.toBeNull();
  });

  it("should render the slot of the Tag", () => {
    const { getByText } = render(TagTest);

    expect(getByText("Test_Tag")).toBeInTheDocument();
  });
});

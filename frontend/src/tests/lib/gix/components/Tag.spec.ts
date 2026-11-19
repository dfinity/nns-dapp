import Tag from "$lib/gix/components/Tag.svelte";
import TagTest from "$tests/lib/gix/components/TagTest.svelte";
import { mockSnippet } from "$tests/lib/gix/mocks/snippet.mocks";
import { render } from "@testing-library/svelte";

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

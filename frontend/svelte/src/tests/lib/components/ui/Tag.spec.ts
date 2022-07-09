/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import Tag from "../../../../lib/components/ui/Tag.svelte";
import { Color } from "../../../../lib/types/theme";
import TagTest from "./TagTest.svelte";

describe("Tag", () => {
  it("should render a span element by default", () => {
    const { container } = render(Tag);

    expect(container.querySelector("span")).not.toBeNull();
  });

  it("should render the passed tagname", () => {
    const { container } = render(Tag, {
      props: { tagName: "h3" },
    });

    expect(container.querySelector("h3")).not.toBeNull();
  });

  it("should render the slot of the Tag", () => {
    const { getByText } = render(TagTest);

    expect(getByText("Test_Tag")).toBeInTheDocument();
  });

  it("should render a success Tag", () => {
    const { container } = render(Tag, { props: { color: Color.SUCCESS } });

    expect(container.querySelector("span.success")).not.toBeNull();
  });

  it("should render a warning Tag", () => {
    const { container } = render(Tag, { props: { color: Color.WARNING } });

    expect(container.querySelector("span.warning")).not.toBeNull();
  });
});

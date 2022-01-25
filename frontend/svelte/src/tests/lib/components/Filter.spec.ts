/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/svelte";
import Filter from "../../../lib/components/Filter.svelte";
import { expect } from "@jest/globals";

describe("Filter", () => {
  const props: { filters: string[]; key: "topics" | "rewards" | "proposals" } =
    {
      filters: ["a", "b", "c"],
      key: "topics",
    };

  it("should render a title", () => {
    const { container } = render(Filter, { props });

    expect(container.querySelector("h2")).not.toBeNull();
  });

  it("should render filters", () => {
    const { container } = render(Filter, { props });

    expect(container.querySelectorAll("div.options > div").length).toEqual(
      props.filters.length
    );
  });

  it("should render an expand icon", () => {
    const { container } = render(Filter, { props });

    expect(container.querySelector("div.expand")).not.toBeNull();
    expect(container.querySelector("div.expand svg")).not.toBeNull();
  });

  it("should trigger action filter", (done) => {
    const { container, component } = render(Filter, {
      props,
    });

    component.$on("nnsFilter", (e) => {
      done();
    });

    const div: HTMLDivElement | null = container.querySelector("div.filter");
    fireEvent.click(div);
  });
});

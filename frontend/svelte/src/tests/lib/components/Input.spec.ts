/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import Input from "../../../lib/components/Input.svelte";

describe("Input", () => {
  const props = { name: "name", placeholderLabelKey: "test.placeholder" };

  it("should render an input", () => {
    const { container } = render(Input, {
      props,
    });

    const input: HTMLInputElement | null = container.querySelector("input");
    expect(input).not.toBeNull();
  });

  it("should render an input of type number", () => {
    const { container } = render(Input, {
      props,
    });

    const input: HTMLInputElement | null = container.querySelector("input");
    expect(input.getAttribute("type")).toEqual("number");
  });

  it("should render an input of type text", () => {
    const { container } = render(Input, {
      props: {
        ...props,
        inputType: "text",
      },
    });

    const input: HTMLInputElement | null = container.querySelector("input");
    expect(input.getAttribute("type")).toEqual("text");
  });

  it("should render a required input", () => {
    const { container } = render(Input, {
      props,
    });

    const input: HTMLInputElement | null = container.querySelector("input");
    expect(input.hasAttribute("required")).toBeTruthy();
  });

  it("should render a required input", () => {
    const { container } = render(Input, {
      props: { ...props, required: false },
    });

    const input: HTMLInputElement | null = container.querySelector("input");
    expect(input.hasAttribute("required")).toBeFalsy();
  });
});

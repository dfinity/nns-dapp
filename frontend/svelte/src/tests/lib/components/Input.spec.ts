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

  it("should render a placeholder", () => {
    const { getByText } = render(Input, {
      props,
    });

    expect(getByText("test.placeholder")).toBeInTheDocument();
  });

  const testGetAttribute = ({
    attribute,
    expected,
    container,
  }: {
    attribute: string;
    expected: string;
    container: HTMLElement;
  }) => {
    const input: HTMLInputElement | null = container.querySelector("input");
    expect(input.getAttribute(attribute)).toEqual(expected);
  };

  const testHasAttribute = ({
    attribute,
    expected,
    container,
  }: {
    attribute: string;
    expected: boolean;
    container: HTMLElement;
  }) => {
    const input: HTMLInputElement | null = container.querySelector("input");
    expect(input.hasAttribute(attribute)).toEqual(expected);
  };

  it("should render an input of type number", () => {
    const { container } = render(Input, {
      props,
    });

    testGetAttribute({ container, attribute: "type", expected: "number" });
  });

  it("should render an input of type text", () => {
    const { container } = render(Input, {
      props: {
        ...props,
        inputType: "text",
      },
    });

    testGetAttribute({ container, attribute: "type", expected: "text" });
  });

  it("should render a required input", () => {
    const { container } = render(Input, {
      props,
    });

    testHasAttribute({ container, attribute: "required", expected: true });
  });

  it("should render a required input", () => {
    const { container } = render(Input, {
      props: { ...props, required: false },
    });

    testHasAttribute({ container, attribute: "required", expected: false });
  });

  it("should render an input without spellcheck", () => {
    const { container } = render(Input, {
      props,
    });

    testHasAttribute({ container, attribute: "spellcheck", expected: false });
  });

  it("should render an input with spellcheck", () => {
    const { container } = render(Input, {
      props: { ...props, spellcheck: true },
    });

    testHasAttribute({ container, attribute: "spellcheck", expected: true });
  });

  it("should render an input with step any", () => {
    const { container } = render(Input, {
      props,
    });

    testGetAttribute({ container, attribute: "step", expected: "any" });
  });

  it("should render an input with a particular step attribute", () => {
    const { container } = render(Input, {
      props: {
        ...props,
        step: 2,
      },
    });

    testGetAttribute({ container, attribute: "step", expected: "2" });
  });

  it("should render an input with no step", () => {
    const { container } = render(Input, {
      props: {
        ...props,
        inputType: "text",
      },
    });

    testHasAttribute({ container, attribute: "step", expected: false });
  });
});

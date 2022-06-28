/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/svelte";
import Input from "../../../../lib/components/ui/Input.svelte";
import InputTest from "./InputTest.svelte";
import InputValueTest from "./InputValueTest.svelte";

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
    expect(input?.getAttribute(attribute)).toEqual(expected);
  };

  const testHasAttribute = ({
    attribute,
    expected,
    container,
    expectedValue,
  }: {
    attribute: string;
    expected: boolean;
    container: HTMLElement;
    expectedValue?: boolean;
  }) => {
    const input: HTMLInputElement | null = container.querySelector("input");
    expect(input?.hasAttribute(attribute)).toEqual(expected);
    if (expectedValue !== undefined) {
      expect(input?.getAttribute(attribute)).toEqual(expectedValue);
    }
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

  it("should render an input without autocomplete", () => {
    const { container } = render(Input, {
      props,
    });

    testHasAttribute({ container, attribute: "autocomplete", expected: false });
  });

  it("should render an input with autocomplete", () => {
    const { container } = render(Input, {
      props: {
        ...props,
        inputType: "text",
        autocomplete: "off",
      },
    });

    testHasAttribute({ container, attribute: "autocomplete", expected: true });
  });

  it("should render an input with step any", () => {
    const { container } = render(Input, {
      props,
    });

    testGetAttribute({ container, attribute: "step", expected: "any" });
  });

  it("should render a text input with autocomplete to off as default value", () => {
    const { container } = render(Input, {
      props: {
        ...props,
        inputType: "text",
      },
    });

    testGetAttribute({ container, attribute: "autocomplete", expected: "off" });
  });

  it("should render an input with min length", () => {
    const { container } = render(Input, {
      props: { ...props, minLength: 10 },
    });

    testGetAttribute({ container, attribute: "minLength", expected: "10" });
  });

  it("should render an input with a max attribute", () => {
    const { container } = render(Input, {
      props: { ...props, max: 10 },
    });

    testGetAttribute({ container, attribute: "max", expected: "10" });
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

  it("should only accept number as input", () => {
    const { container } = render(Input, {
      props,
    });

    const input: HTMLInputElement | null = container.querySelector("input");
    expect(input).not.toBeNull();
    if (input) {
      fireEvent.change(input, { target: { value: "test" } });
      expect(input.value).toBe("");

      fireEvent.change(input, { target: { value: "123" } });
      expect(input.value).toBe("123");
    }
  });

  it("should accept text as input", () => {
    const { container } = render(Input, {
      props: {
        ...props,
        inputType: "text",
      },
    });

    const input: HTMLInputElement | null = container.querySelector("input");
    expect(input).not.toBeNull();
    if (input) {
      fireEvent.change(input, { target: { value: "test" } });
      expect(input.value).toBe("test");

      fireEvent.change(input, { target: { value: "123" } });
      expect(input.value).toBe("123");

      fireEvent.change(input, { target: { value: "test123" } });
      expect(input.value).toBe("test123");
    }
  });

  it("should render the button slot", () => {
    const { getByText } = render(InputTest, {
      props: {
        props: {
          ...props,
          inputType: "text",
        },
      },
    });
    expect(getByText("Test Button")).toBeInTheDocument();
  });

  it("should not be disabled per default", () => {
    const { container } = render(Input, {
      props: { ...props },
    });

    testHasAttribute({ container, attribute: "disabled", expected: false });
  });

  it("should render a disabled input", () => {
    const { container } = render(Input, {
      props: { ...props, disabled: true },
    });

    testHasAttribute({ container, attribute: "disabled", expected: true });
  });

  it("should bind value", async () => {
    const { container } = render(InputValueTest, {
      props: {
        ...props,
        inputType: "text",
      },
    });

    const testInput = "new value";
    const testBind: HTMLSpanElement | null = container.querySelector("#test");
    testBind && (await fireEvent.click(testBind));

    const input: HTMLInputElement | null = container.querySelector("input");
    expect(input?.value).toBe(testInput);
  });

  describe("inputType=icp", () => {
    it("should render an input of type icp as text", () => {
      const { container } = render(Input, {
        props: {
          ...props,
          inputType: "icp",
        },
      });

      testGetAttribute({ container, attribute: "type", expected: "text" });
    });

    it("should bind value", (done) => {
      const { container, component } = render(InputValueTest, {
        props: {
          ...props,
          inputType: "icp",
        },
      });

      const input: HTMLInputElement | null = container.querySelector("input");

      if (input === null) {
        throw new Error("No input");
      }

      fireEvent.input(input, { target: { value: "100" } });
      expect(input.value).toBe("100");

      component.$on("testAmount", ({ detail }) => {
        expect(detail.amount).toBe(100);
        done();
      });
    });

    it("should not accept not icp formatted changed", async () => {
      const { container } = render(Input, {
        props: {
          ...props,
          value: "1",
          inputType: "icp",
        },
      });

      const input: HTMLInputElement | null = container.querySelector("input");

      if (input === null) {
        throw new Error("No input");
      }

      fireEvent.input(input, { target: { value: "100" } });
      expect(input.value).toBe("100");

      fireEvent.input(input, { target: { value: "test" } });
      expect(input.value).toBe("100");

      fireEvent.input(input, { target: { value: "123" } });
      expect(input.value).toBe("123");

      fireEvent.input(input, { target: { value: ".0000001" } });
      expect(input.value).toBe(".0000001");

      fireEvent.input(input, { target: { value: ".000000001" } });
      expect(input.value).toBe(".0000001");
    });

    it('should replace "" with undefined', (done) => {
      const { container, component } = render(InputValueTest, {
        props: {
          ...props,
          value: "0",
          inputType: "icp",
        },
      });

      const input: HTMLInputElement | null = container.querySelector("input");

      if (input === null) {
        throw new Error("No input");
      }

      fireEvent.input(input, { target: { value: "" } });
      expect(input.value).toBe("");

      component.$on("testAmount", ({ detail }) => {
        expect(detail.amount).toBe(undefined);
        done();
      });
    });
  });
});

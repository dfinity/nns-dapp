import Input from "$lib/gix/components/Input.svelte";
import { assertNonNullish, isNullish, nonNullish } from "@dfinity/utils";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { tick } from "svelte";
import InputCurrencyTest from "./InputCurrencyTest.svelte";
import InputElementTest from "./InputElementTest.svelte";
import InputTest from "./InputTest.svelte";
import InputValueTest from "./InputValueTest.svelte";

describe("Input", () => {
  type InputType = "icp" | "number" | "text" | "currency";
  type AutoComplete = "on" | "off" | undefined;

  const props = { name: "name", placeholder: "test.placeholder" };

  it("should render an input", () => {
    const { container } = render(Input, {
      props,
    });

    const input: HTMLInputElement | null = container.querySelector("input");

    expect(input).not.toBeNull();
  });

  it("should render a placeholder", () => {
    const { container } = render(Input, {
      props,
    });

    expect(container.querySelector("input")?.getAttribute("placeholder")).toBe(
      "test.placeholder"
    );
  });

  const testGetAttribute = ({
    attribute,
    expected,
    container,
  }: {
    attribute: string;
    expected: string | null | undefined;
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
    expectedValue?: string;
  }) => {
    const input: HTMLInputElement | null = container.querySelector("input");

    expect(input?.hasAttribute(attribute)).toEqual(expected);

    if (nonNullish(expectedValue)) {
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

  it("should not render a required input", () => {
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

    assertNonNullish(input);

    fireEvent.change(input, { target: { value: "test" } });

    expect(input.value).toBe("");

    fireEvent.change(input, { target: { value: "123" } });

    expect(input.value).toBe("123");
  });

  it("should accept text as input", () => {
    const { container } = render(Input, {
      props: {
        ...props,
        inputType: "text",
      },
    });

    const input: HTMLInputElement | null = container.querySelector("input");

    assertNonNullish(input);

    fireEvent.change(input, { target: { value: "test" } });

    expect(input.value).toBe("test");

    fireEvent.change(input, { target: { value: "123" } });

    expect(input.value).toBe("123");

    fireEvent.change(input, { target: { value: "test123" } });

    expect(input.value).toBe("test123");
  });

  it("should render the button slot", () => {
    const { getByText } = render(InputTest, {
      props: {
        ...props,
        inputType: "text",
      },
    });

    expect(getByText("Test Button")).toBeInTheDocument();
  });

  it("should render the start slot", () => {
    const { getByText } = render(InputTest, {
      props: {
        ...props,
        inputType: "text",
      },
    });

    expect(getByText("Left Button")).toBeInTheDocument();
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

  it("should render an attribute to ignore 1Password", () => {
    const { container } = render(Input, {
      props,
    });

    testHasAttribute({
      container,
      attribute: "data-1p-ignore",
      expected: true,
    });
  });

  it("should render an attribute that do not ignore 1Password", () => {
    const { container } = render(Input, {
      props: { ...props, ignore1Password: false },
    });

    testHasAttribute({
      container,
      attribute: "data-1p-ignore",
      expected: true,
      expectedValue: "false",
    });
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

    it("should bind value", () => {
      const testProps = $state({
        ...props,
        inputType: "icp" as const,
        amount: undefined,
      });

      const { container } = render(InputValueTest, {
        props: testProps,
      });

      const input: HTMLInputElement | null = container.querySelector("input");

      if (isNullish(input)) {
        throw new Error("No input");
      }

      fireEvent.input(input, { target: { value: "100" } });

      expect(input.value).toBe("100");

      expect(testProps.amount).toBe(100);
    });

    it("should bind value as string", () => {
      const ethValue = "0.000000094829004242";

      const testProps = $state({
        ...props,
        inputType: "currency" as const,
        decimals: 18,
        amount: undefined,
      });

      const { container } = render(InputValueTest, {
        props: testProps,
      });

      const input: HTMLInputElement | null = container.querySelector("input");
      assertNonNullish(input);

      fireEvent.input(input, { target: { value: ethValue } });

      expect(input.value).toBe(ethValue);

      expect(testProps.amount).toBe(ethValue);
    });

    it("should not accept not icp formatted changed", () => {
      const { container } = render(Input, {
        props: {
          ...props,
          value: "1",
          inputType: "icp",
        },
      });

      const input: HTMLInputElement | null = container.querySelector("input");

      if (isNullish(input)) {
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

    it('should replace "" with undefined', () => {
      const testProps = $state({
        ...props,
        value: "0",
        inputType: "icp" as const,
        amount: undefined,
      });

      const { container } = render(InputValueTest, {
        props: testProps,
      });

      const input: HTMLInputElement | null = container.querySelector("input");

      if (isNullish(input)) {
        throw new Error("No input");
      }

      fireEvent.input(input, { target: { value: "" } });

      expect(input.value).toBe("");

      expect(testProps.amount).toBe(undefined);
    });

    it("should avoid exponent formatted initial zero in icp mode", () => {
      const { container } = render(InputValueTest, {
        props: {
          ...props,
          value: `0`,
          inputType: "icp",
        },
      });

      expect(container.querySelector("input")?.value).toBe("0");
    });

    it("should avoid exponent formatted initial value (<0) in icp mode", () => {
      const { container } = render(InputValueTest, {
        props: {
          ...props,
          value: `0.00000001`,
          inputType: "icp",
        },
      });

      expect(container.querySelector("input")?.value).toBe("0.00000001");
    });

    it("should avoid exponent formatted on change in icp mode", async () => {
      const testProps = $state({
        ...props,
        value: "",
        inputType: "icp" as const,
      });

      const { container } = render(Input, {
        props: testProps,
      });

      const input: HTMLInputElement | null = container.querySelector("input");

      if (isNullish(input)) {
        throw new Error("No input");
      }

      testProps.value = "0.00000001";

      // svelte does not update the dom immediately
      expect(input.value).toBe("");

      await tick();

      expect(input.value).toBe("0.00000001");
    });

    it("should avoid exponent formatted initial value (>0) in icp mode", () => {
      const { container } = render(InputValueTest, {
        props: {
          ...props,
          value: `11111111.11111111`,
          inputType: "icp",
        },
      });

      expect(container.querySelector("input")?.value).toBe("11111111.11111111");
    });

    it("should accept custom decimals in currency mode", () => {
      const { container } = render(InputValueTest, {
        props: {
          ...props,
          value: "1",
          inputType: "currency",
          decimals: 12,
        },
      });

      const input: HTMLInputElement | null = container.querySelector("input");
      assertNonNullish(input);

      fireEvent.input(input, { target: { value: "111.1234567891" } });

      expect(input.value).toBe("111.1234567891");
    });

    it("should trim once custom decimals length is reached", () => {
      const { container } = render(InputValueTest, {
        props: {
          ...props,
          value: "0.000000011231232121",
          inputType: "currency",
          decimals: 18,
        },
      });

      const input: HTMLInputElement | null = container.querySelector("input");
      assertNonNullish(input);

      fireEvent.input(input, { target: { value: "0.0000000112312321219" } });

      expect(input.value).toBe("0.000000011231232121");
    });

    it("should not trim below given decimals", async () => {
      const { container, getByTestId } = render(InputCurrencyTest, {
        props: {
          ...props,
          decimals: 18,
        },
      });

      const input: HTMLInputElement | null = container.querySelector("input");
      assertNonNullish(input);

      const testValue = getByTestId("amount-decimals-output");

      fireEvent.input(input, { target: { value: "0.999999999999999876" } });

      await tick();

      expect(testValue.textContent).toBe("0.999999999999999876");

      fireEvent.input(input, { target: { value: "0.100000000000000843" } });

      await tick();

      expect(testValue.textContent).toBe("0.100000000000000843");

      fireEvent.input(input, { target: { value: "0.9999999999919999" } });

      await tick();

      expect(testValue.textContent).toBe("0.9999999999919999");
    });

    it("should not round custom decimals with JS imprecision", () => {
      const testProps = $state({
        ...props,
        value: "0.12",
        inputType: "currency" as const,
        decimals: 18,
        amount: undefined,
      });

      const { container } = render(InputValueTest, {
        props: testProps,
      });

      const input: HTMLInputElement | null = container.querySelector("input");
      assertNonNullish(input);

      fireEvent.input(input, { target: { value: "0.122" } });

      expect(testProps.amount).not.toBe("0.121999999999999997");
      expect(testProps.amount).toBe("0.122");
    });
  });

  it("should bind input element", () => {
    const { container } = render(InputElementTest, {
      props,
    });

    const input: HTMLInputElement | null = container.querySelector("input");

    expect(input === document.activeElement).toBeFalsy();

    const testBind: HTMLButtonElement | null = container.querySelector("#test");
    testBind && testBind.click();

    expect(input === document.activeElement).toBeTruthy();
  });

  it("should autofocus the input when autofocus is true", async () => {
    const { container } = render(Input, {
      props: { ...props, autofocus: true },
    });

    const input: HTMLInputElement | null = container.querySelector("input");

    expect(input).not.toBeNull();

    await waitFor(() => {
      // Check if the input is the active element
      expect(input === document.activeElement).toBeTruthy();
    });
  });

  it("should not focus by default", async () => {
    const { container } = render(Input, {
      props: { ...props },
    });

    const input: HTMLInputElement | null = container.querySelector("input");

    expect(input).not.toBeNull();

    await waitFor(() => {
      // Check if the input is the active element
      expect(input === document.activeElement).toBeFalsy();
    });
  });

  it("should not render autofocus by default", () => {
    const { container } = render(Input, {
      props: { ...props },
    });

    testHasAttribute({ container, attribute: "autofocus", expected: false });
  });

  describe.each(["number"])("inputType=%s", (inputType) => {
    it("should never set autocomplete", () => {
      const { container: container1 } = render(Input, {
        props: {
          ...props,
          inputType: inputType as InputType,
          autocomplete: "off",
        },
      });

      testGetAttribute({
        container: container1,
        attribute: "autocomplete",
        expected: null,
      });

      const { container: container2 } = render(Input, {
        props: {
          ...props,
          inputType: inputType as InputType,
          autocomplete: "on",
        },
      });

      testGetAttribute({
        container: container2,
        attribute: "autocomplete",
        expected: null,
      });
    });
  });

  describe.each(["icp", "text", "currency"])("inputType='%s'", (inputType) => {
    describe.each([["on"], ["off"], [undefined, "off"]])(
      "autocomplete='%s'",
      (autocomplete, expected = undefined) => {
        it(`should set autocomplete to '${expected}' for inputType='${inputType}' and autocomplete='${autocomplete}'`, () => {
          const { container } = render(Input, {
            props: {
              ...props,
              inputType: inputType as InputType,
              autocomplete: autocomplete as AutoComplete,
            },
          });

          testGetAttribute({
            container,
            attribute: "autocomplete",
            expected: autocomplete ?? expected,
          });
        });
      }
    );
  });
});
